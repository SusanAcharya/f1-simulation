import { authAPI, driverAPI, carAPI, raceAPI, leaderboardAPI } from './api'
import type { UserProfile, Driver, Car } from '../types/domain'

export const gameService = {
  // Load user profile and related data
  async loadUserData(): Promise<{ profile: UserProfile; driver: Driver; car: Car }> {
    try {
      const [profileResponse, driverResponse, carResponse] = await Promise.all([
        authAPI.getProfile(),
        driverAPI.getDriver(),
        carAPI.getCar()
      ])

      return {
        profile: profileResponse.data,
        driver: driverResponse.data,
        car: carResponse.data
      }
    } catch (error) {
      console.error('Failed to load user data:', error)
      throw error
    }
  },

  // Update driver stats
  async updateDriver(data: Partial<Driver>): Promise<Driver> {
    try {
      const response = await driverAPI.updateDriver(data)
      return response.data
    } catch (error) {
      console.error('Failed to update driver:', error)
      throw error
    }
  },

  // Update car stats
  async updateCar(data: Partial<Car>): Promise<Car> {
    try {
      const response = await carAPI.updateCar(data)
      return response.data
    } catch (error) {
      console.error('Failed to update car:', error)
      throw error
    }
  },

  // Repair car
  async repairCar(cost: number): Promise<{ car: Car; tokensSpent: number; conditionRestored: number }> {
    try {
      const response = await carAPI.repairCar(cost)
      return response.data
    } catch (error) {
      console.error('Failed to repair car:', error)
      throw error
    }
  },

  // Boost car condition
  async boostCarCondition(tokens: number): Promise<{ car: Car; tokensSpent: number; conditionBoosted: number }> {
    try {
      const response = await carAPI.boostCarCondition(tokens)
      return response.data
    } catch (error) {
      console.error('Failed to boost car condition:', error)
      throw error
    }
  },

  // Get races
  async getRaces() {
    try {
      const response = await raceAPI.getRace('current')
      return response.data
    } catch (error) {
      console.error('Failed to get races:', error)
      throw error
    }
  },

  // Get leaderboard
  async getLeaderboard(limit?: number) {
    try {
      const response = await leaderboardAPI.getLeaderboard(limit)
      return response.data
    } catch (error) {
      console.error('Failed to get leaderboard:', error)
      throw error
    }
  },

  async upgradeFacility(type: 'training' | 'warehouse') {
    try {
      const response = await authAPI.upgradeFacility(type)
      return response.data as { profile: UserProfile; driver: Driver | null; car: Car | null }
    } catch (error) {
      console.error('Failed to upgrade facility:', error)
      throw error
    }
  },

  // Get user rank
  async getUserRank() {
    try {
      const response = await leaderboardAPI.getUserRank()
      return response.data
    } catch (error) {
      console.error('Failed to get user rank:', error)
      throw error
    }
  },

  // Join race
  async joinRace(raceId: string) {
    try {
      const response = await raceAPI.joinRace(raceId)
      return response.data
    } catch (error) {
      console.error('Failed to join race:', error)
      throw error
    }
  },

  // Simulate race
  async simulateRace(raceId: string) {
    try {
      const response = await raceAPI.simulateRace(raceId)
      return response.data
    } catch (error) {
      console.error('Failed to simulate race:', error)
      throw error
    }
  }
}
