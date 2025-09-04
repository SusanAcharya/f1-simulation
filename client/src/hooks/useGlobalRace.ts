import { useState, useEffect } from 'react'
import { globalRaceService } from '../services/globalRaceService'
import type { RaceState } from '../services/raceSimulation'

export function useGlobalRace() {
  const [raceState, setRaceState] = useState<RaceState | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Subscribe to race state updates
    const unsubscribe = globalRaceService.subscribe((state) => {
      setRaceState(state)
    })

    // Get initial state
    const initialState = globalRaceService.getRaceState()
    if (initialState) {
      setRaceState(initialState)
    }

    return unsubscribe
  }, [])

  const startRace = () => {
    globalRaceService.startRace()
  }

  const resetRace = () => {
    globalRaceService.resetRace()
  }

  const initializeRace = async (raceData: any, participants: any[]) => {
    setIsLoading(true)
    try {
      globalRaceService.initializeRace(raceData, participants)
    } finally {
      setIsLoading(false)
    }
  }

  return {
    raceState,
    isLoading,
    startRace,
    resetRace,
    initializeRace
  }
}
