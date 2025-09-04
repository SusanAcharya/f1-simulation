import { create } from 'zustand'
import type { Car, Driver, UserProfile } from '../types/domain'
import { gameService } from '../services/gameService'

type GameState = {
  userProfile: UserProfile | null
  driver: Driver | null
  car: Car | null
  loading: boolean
  error: string | null
  setUserProfile: (p: UserProfile | null) => void
  setDriver: (d: Driver | null) => void
  setCar: (c: Car | null) => void
  grantTokens: (amount: number) => void
  loadUserData: () => Promise<void>
  updateDriver: (data: Partial<Driver>) => Promise<void>
  updateCar: (data: Partial<Car>) => Promise<void>
  repairCar: (cost: number) => Promise<void>
  boostCarCondition: (tokens: number) => Promise<void>
  upgradeFacility: (type: 'training' | 'warehouse') => Promise<void>
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export const useGameStore = create<GameState>((set, get) => ({
  userProfile: null,
  driver: null,
  car: null,
  loading: false,
  error: null,
  setUserProfile: (p) => set({ userProfile: p }),
  setDriver: (d) => set({ driver: d }),
  setCar: (c) => set({ car: c }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  grantTokens: (amount) => {
    const p = get().userProfile
    if (!p) return
    set({ userProfile: { ...p, tokens: p.tokens + amount } })
  },
  upgradeFacility: async (type) => {
    set({ loading: true, error: null })
    try {
      const result = await gameService.upgradeFacility(type)
      set({ 
        userProfile: result.profile, 
        driver: result.driver ?? get().driver, 
        car: result.car ?? get().car,
        loading: false 
      })
    } catch (error: any) {
      set({ error: error.message || 'Failed to upgrade facility', loading: false })
    }
  },
  loadUserData: async () => {
    set({ loading: true, error: null })
    try {
      const data = await gameService.loadUserData()
      set({ 
        userProfile: data.profile, 
        driver: data.driver, 
        car: data.car,
        loading: false 
      })
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to load user data',
        loading: false 
      })
    }
  },
  updateDriver: async (data) => {
    set({ loading: true, error: null })
    try {
      const updatedDriver = await gameService.updateDriver(data)
      set({ driver: updatedDriver, loading: false })
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to update driver',
        loading: false 
      })
    }
  },
  updateCar: async (data) => {
    set({ loading: true, error: null })
    try {
      const updatedCar = await gameService.updateCar(data)
      set({ car: updatedCar, loading: false })
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to update car',
        loading: false 
      })
    }
  },
  repairCar: async (cost) => {
    set({ loading: true, error: null })
    try {
      const result = await gameService.repairCar(cost)
      set({ 
        car: result.car, 
        loading: false 
      })
      // Update user profile tokens
      const profile = get().userProfile
      if (profile) {
        set({ userProfile: { ...profile, tokens: profile.tokens - result.tokensSpent } })
      }
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to repair car',
        loading: false 
      })
    }
  },
  boostCarCondition: async (tokens) => {
    set({ loading: true, error: null })
    try {
      const result = await gameService.boostCarCondition(tokens)
      set({ 
        car: result.car, 
        loading: false 
      })
      // Update user profile tokens
      const profile = get().userProfile
      if (profile) {
        set({ userProfile: { ...profile, tokens: profile.tokens - result.tokensSpent } })
      }
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to boost car condition',
        loading: false 
      })
    }
  }
}))

// Helper to create default state for new users
export function createDefaultState(userId: string) {
  const profile: UserProfile = {
    id: userId,
    email: `${userId}@local`,
    username: 'NewRacer',
    tokens: 25,
    points: 0,
    joinedDate: new Date().toISOString(),
    driverId: 'driver-1',
    carId: 'car-1',
    facility: { trainingLevel: 1, warehouseLevel: 1 },
  }

  const driver: Driver = {
    id: 'driver-1',
    userId,
    name: 'New Driver',
    stats: { cornering: 50, overtaking: 50, defending: 50, aggression: 50, composure: 50 },
    statPointsAvailable: 5,
  }

  const car: Car = {
    id: 'car-1',
    userId,
    name: 'Starter Car',
    stats: { speed: 50, acceleration: 50, braking: 50, aero: 50, fuel: 50, tireWear: 50, grip: 50, durability: 50 },
    statPointsAvailable: 5,
    condition: 100,
  }

  const store = useGameStore.getState()
  store.setUserProfile(profile)
  store.setDriver(driver)
  store.setCar(car)
}


