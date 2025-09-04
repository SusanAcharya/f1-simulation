export type DriverStats = {
  cornering: number
  overtaking: number
  defending: number
  aggression: number
  composure: number
}

export type CarStats = {
  speed: number
  acceleration: number
  braking: number
  aero: number
  fuel: number
  tireWear: number
  grip: number
  durability: number
}

export type Driver = {
  id: string
  userId: string
  name: string
  stats: DriverStats
  statPointsAvailable: number
}

export type Car = {
  id: string
  userId: string
  name: string
  stats: CarStats
  statPointsAvailable: number
  condition: number
}

export type Facility = {
  trainingLevel: number
  warehouseLevel: number
}

export type UserProfile = {
  id: string
  email: string
  username: string
  tokens: number
  points: number
  joinedDate: string
  driverId: string
  carId: string
  facility: Facility
}


