import type { RaceParticipant } from './raceSimulation'

export type RaceHistoryEntry = {
  id: string
  raceName: string
  track: string
  date: string
  totalLaps: number
  participants: RaceParticipant[]
  winner: RaceParticipant
  podium: RaceParticipant[]
  totalParticipants: number
}

class RaceHistoryService {
  private storageKey = 'vibe-race-history'
  private maxHistoryEntries = 50 // Keep last 50 races

  // Save a completed race to history
  saveRaceToHistory(raceState: any) {
    try {
      const historyEntry: RaceHistoryEntry = {
        id: raceState.id,
        raceName: raceState.name,
        track: raceState.track,
        date: new Date().toISOString(),
        totalLaps: raceState.totalLaps,
        participants: raceState.participants.map((p: RaceParticipant) => ({
          ...p,
          // Ensure we have the final race data
          earnedPoints: p.earnedPoints || 0,
          earnedTokens: p.earnedTokens || 0,
          dnf: p.dnf || false
        })),
        winner: raceState.participants.find((p: RaceParticipant) => p.position === 1),
        podium: raceState.participants
          .filter((p: RaceParticipant) => p.position <= 3)
          .sort((a: RaceParticipant, b: RaceParticipant) => a.position - b.position),
        totalParticipants: raceState.participants.length
      }

      // Get existing history
      const existingHistory = this.getRaceHistory()
      
      // Add new entry at the beginning (most recent first)
      const updatedHistory = [historyEntry, ...existingHistory].slice(0, this.maxHistoryEntries)
      
      // Save to localStorage
      localStorage.setItem(this.storageKey, JSON.stringify(updatedHistory))
      
      console.log('Race saved to history:', historyEntry.id)
    } catch (error) {
      console.error('Failed to save race to history:', error)
    }
  }

  // Get all race history
  getRaceHistory(): RaceHistoryEntry[] {
    try {
      const saved = localStorage.getItem(this.storageKey)
      if (saved) {
        return JSON.parse(saved)
      }
    } catch (error) {
      console.error('Failed to load race history:', error)
    }
    return []
  }

  // Get race history for a specific user
  getUserRaceHistory(userId: string): RaceHistoryEntry[] {
    const allHistory = this.getRaceHistory()
    return allHistory.filter(race => 
      race.participants.some(p => p.userId === userId)
    )
  }

  // Get user's statistics
  getUserStats(userId: string) {
    const userHistory = this.getUserRaceHistory(userId)
    
    if (userHistory.length === 0) {
      return {
        totalRaces: 0,
        wins: 0,
        podiums: 0,
        totalPoints: 0,
        totalTokens: 0,
        averagePosition: 0,
        bestPosition: 0,
        dnfCount: 0
      }
    }

    let totalPoints = 0
    let totalTokens = 0
    let wins = 0
    let podiums = 0
    let dnfCount = 0
    let totalPosition = 0
    let bestPosition = 999

    userHistory.forEach(race => {
      const userParticipant = race.participants.find(p => p.userId === userId)
      if (userParticipant) {
        totalPoints += userParticipant.earnedPoints || 0
        totalTokens += userParticipant.earnedTokens || 0
        totalPosition += userParticipant.position
        
        if (userParticipant.position === 1) wins++
        if (userParticipant.position <= 3) podiums++
        if (userParticipant.dnf) dnfCount++
        if (userParticipant.position < bestPosition) bestPosition = userParticipant.position
      }
    })

    return {
      totalRaces: userHistory.length,
      wins,
      podiums,
      totalPoints,
      totalTokens,
      averagePosition: Math.round((totalPosition / userHistory.length) * 10) / 10,
      bestPosition: bestPosition === 999 ? 0 : bestPosition,
      dnfCount
    }
  }

  // Clear all race history
  clearHistory() {
    try {
      localStorage.removeItem(this.storageKey)
    } catch (error) {
      console.error('Failed to clear race history:', error)
    }
  }
}

// Create singleton instance
export const raceHistoryService = new RaceHistoryService()
