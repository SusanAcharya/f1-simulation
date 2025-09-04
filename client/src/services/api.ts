import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  login: (username: string, password: string) =>
    api.post<any>('/auth/login', { username, password }),
  
  register: (username: string, email: string, password: string) =>
    api.post<any>('/auth/register', { username, email, password }),
  
  getProfile: () =>
    api.get<any>('/auth/profile'),

  getUserById: (id: string) =>
    api.get<any>(`/auth/user/${id}`),

  upgradeFacility: (type: 'training' | 'warehouse') =>
    api.post<any>('/auth/facility/upgrade', { type }),
}

// Driver API
export const driverAPI = {
  getDriver: () =>
    api.get<any>('/driver'),
  
  updateDriver: (data: any) =>
    api.put<any>('/driver', data),
}

// Car API
export const carAPI = {
  getCar: () =>
    api.get<any>('/car'),
  
  updateCar: (data: any) =>
    api.put<any>('/car', data),
  
  repairCar: (cost: number) =>
    api.post<any>('/car/repair', { cost }),
  
  boostCarCondition: (tokens: number) =>
    api.post<any>('/car/boost-condition', { tokens }),
}

// Race API
export const raceAPI = {
  getCurrentRace: () =>
    api.get<any>('/races/current'),
  
  getRace: (id: string) =>
    api.get<any>(`/races/${id}`),
  
  joinRace: (raceId: string) =>
    api.post<any>('/races/join', { raceId }),
  
  simulateRace: (raceId: string) =>
    api.post<any>(`/races/${raceId}/simulate`),
  completeRace: (raceId: string, results: any) =>
    api.post<any>(`/races/${raceId}/complete`, { results }),
  
  getDemoRace: () =>
    api.get<any>('/races/demo'),
  
  getRaceHistory: () =>
    api.get<any>('/races/history'),
}

// Leaderboard API
export const leaderboardAPI = {
  getLeaderboard: (limit?: number) =>
    api.get<any>('/leaderboard', { params: { limit } }),
  
  getUserRank: () =>
    api.get<any>('/leaderboard/my-rank'),
}

export default api
