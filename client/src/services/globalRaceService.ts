import { RaceSimulation, type RaceState } from './raceSimulation'
import { raceHistoryService } from './raceHistoryService'
import { raceAPI } from './api'

class GlobalRaceService {
  private simulation: RaceSimulation | null = null
  private listeners: Set<(state: RaceState) => void> = new Set()
  private currentRaceState: RaceState | null = null

  // Initialize race simulation
  initializeRace(raceData: any, participants: any[]) {
    // Clean up existing simulation
    if (this.simulation) {
      this.simulation.destroy()
    }

    // Don't initialize if no participants
    if (!participants || participants.length === 0) {
      this.currentRaceState = {
        id: 'empty-race',
        name: 'No Race Available',
        track: 'Empty Track',
        status: 'waiting',
        participants: [],
        currentLap: 0,
        totalLaps: 10,
        startTime: null,
        endTime: null,
        lapTimes: {}
      }
      this.notifyListeners()
      return
    }

    this.simulation = new RaceSimulation(raceData, participants)
    
    // Set up event handlers
    this.simulation.onRaceUpdate((state) => {
      this.currentRaceState = state
      this.notifyListeners()
    })
    
    this.simulation.onRaceFinished(async (finalState) => {
      this.currentRaceState = finalState
      this.notifyListeners()
      
      // Save race to history
      raceHistoryService.saveRaceToHistory(finalState)
      
      // Persist to backend for leaderboard/profile consistency
      try {
        const results = finalState.participants.map(p => ({
          userId: p.userId,
          position: p.position,
          points: p.earnedPoints || 0,
          tokens: p.earnedTokens || 0
        }))
        await raceAPI.completeRace(finalState.id || 'live-race', results)
      } catch (e) {
        console.warn('Failed to persist race results', e)
      }
      
      // Clear race state after race finishes
      this.simulation?.clearRaceState()
    })
    
    this.currentRaceState = this.simulation.getRaceState()
    this.notifyListeners()
  }

  // Start the race
  startRace() {
    if (this.simulation) {
      this.simulation.startRace()
    }
  }

  // Reset the race
  resetRace() {
    if (this.simulation) {
      this.simulation.destroy()
      this.simulation.clearRaceState()
      this.simulation = null
      this.currentRaceState = null
      this.notifyListeners()
    }
  }

  // Get current race state
  getRaceState(): RaceState | null {
    return this.currentRaceState
  }

  // Subscribe to race state updates
  subscribe(listener: (state: RaceState) => void) {
    this.listeners.add(listener)
    
    // Immediately call with current state if available
    if (this.currentRaceState) {
      listener(this.currentRaceState)
    }
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener)
    }
  }

  // Notify all listeners of state changes
  private notifyListeners() {
    if (this.currentRaceState) {
      this.listeners.forEach(listener => {
        try {
          listener(this.currentRaceState!)
        } catch (error) {
          console.error('Error notifying race state listener:', error)
        }
      })
    }
  }

  // Clean up
  destroy() {
    if (this.simulation) {
      this.simulation.destroy()
      this.simulation = null
    }
    this.listeners.clear()
    this.currentRaceState = null
  }
}

// Create singleton instance
export const globalRaceService = new GlobalRaceService()

// Clean up on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    globalRaceService.destroy()
  })
}
