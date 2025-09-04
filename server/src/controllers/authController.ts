import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { User } from '../models/User.js'
import { Race } from '../models/Race.js'
import { Driver } from '../models/Driver.js'
import { Car } from '../models/Car.js'
import type { LoginRequest, RegisterRequest, AuthResponse } from '../types/auth.js'

const generateToken = (userId: string, username: string, email: string): string => {
  return jwt.sign(
    { userId, username, email },
    process.env.JWT_SECRET!,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  )
}

export const register = async (req: Request<{}, AuthResponse, RegisterRequest>, res: Response) => {
  try {
    const { username, email, password } = req.body

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ username }, { email }]
    })

    if (existingUser) {
      return res.status(400).json({
        error: existingUser.username === username 
          ? 'Username already taken' 
          : 'Email already registered'
      })
    }

    // Create driver and car for the new user
    const driver = new Driver({
      userId: '', // Will be updated after user creation
      name: `${username} Racer`,
      stats: {
        cornering: 50,
        overtaking: 52,
        defending: 48,
        aggression: 55,
        composure: 50
      },
      statPointsAvailable: 5
    })

    const car = new Car({
      userId: '', // Will be updated after user creation
      name: `${username}'s Speedster`,
      stats: {
        speed: 55,
        acceleration: 52,
        braking: 47,
        aero: 50,
        fuel: 48,
        tireWear: 45,
        grip: 51,
        durability: 50
      },
      statPointsAvailable: 5,
      condition: 92
    })

    // Save driver and car first
    await driver.save()
    await car.save()

    // Create user with references to driver and car
    const user = new User({
      username,
      email,
      password,
      driverId: driver.id,
      carId: car.id,
      tokens: 25,
      points: 0,
      facility: {
        trainingLevel: 1,
        warehouseLevel: 1
      }
    })

    await user.save()

    // Update driver and car with user ID
    driver.userId = user.id
    car.userId = user.id
    await driver.save()
    await car.save()

    const token = generateToken(user.id, user.username, user.email)

    res.status(201).json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      },
      token
    })
  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({ error: 'Registration failed' })
  }
}

export const login = async (req: Request<{}, AuthResponse, LoginRequest>, res: Response) => {
  try {
    const { username, password } = req.body

    // Find user by username
    const user = await User.findOne({ username })
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password)
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const token = generateToken(user.id, user.username, user.email)

    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      },
      token
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: 'Login failed' })
  }
}

export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id

    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json({
      id: user.id,
      email: user.email,
      username: user.username,
      tokens: user.tokens,
      points: user.points,
      joinedDate: user.joinedDate.toISOString(),
      driverId: user.driverId,
      carId: user.carId,
      profilePic: user.profilePic,
      carPic: user.carPic,
      facility: user.facility
    })
  } catch (error) {
    console.error('Get profile error:', error)
    res.status(500).json({ error: 'Failed to get profile' })
  }
}

export const updateUserPictures = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId
    const { profilePic, carPic } = req.body

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const updateData: any = {}
    if (profilePic !== undefined) updateData.profilePic = profilePic
    if (carPic !== undefined) updateData.carPic = carPic

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, select: '-password' }
    )

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json({
      message: 'Pictures updated successfully',
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        tokens: user.tokens,
        points: user.points,
        joinedDate: user.joinedDate.toISOString(),
        driverId: user.driverId,
        carId: user.carId,
        profilePic: user.profilePic,
        carPic: user.carPic,
        facility: user.facility
      }
    })
  } catch (error) {
    console.error('Update pictures error:', error)
    res.status(500).json({ error: 'Failed to update pictures' })
  }
}

export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const user = await User.findById(id)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    const driver = await Driver.findOne({ userId: user.id })
    const car = await Car.findOne({ userId: user.id })

    // Aggregate race stats for this user
    const completed = await Race.find({ status: 'completed', 'results.userId': user.id }, 'results').lean()
    let totalRaces = 0, wins = 0, podiums = 0, totalPosition = 0, bestFinish = 999
    for (const r of completed) {
      for (const res of r.results || []) {
        if (res.userId === user.id) {
          totalRaces += 1
          totalPosition += res.position || 0
          if (res.position === 1) wins += 1
          if (res.position <= 3) podiums += 1
          if (res.position && res.position < bestFinish) bestFinish = res.position
        }
      }
    }
    
    const averagePosition = totalRaces > 0 ? totalPosition / totalRaces : 0

    res.json({
      id: user.id,
      email: user.email,
      username: user.username,
      tokens: user.tokens,
      points: user.points,
      joinedDate: user.joinedDate.toISOString(),
      profilePic: user.profilePic || 1,
      carPic: user.carPic || 1,
      driver: driver ? {
        name: driver.name,
        stats: driver.stats
      } : {
        name: `${user.username} Racer`,
        stats: { cornering: 50, overtaking: 50, defending: 50, aggression: 50, composure: 50 }
      },
      car: car ? {
        name: car.name,
        stats: car.stats,
        condition: car.condition
      } : {
        name: `${user.username}'s Car`,
        stats: { speed: 50, acceleration: 50, braking: 50, aero: 50, fuel: 50, tireWear: 50, grip: 50, durability: 50 },
        condition: 100
      },
      raceStats: { totalRaces, wins, podiums, totalPoints: user.points, bestFinish: bestFinish === 999 ? 0 : bestFinish, averagePosition }
    })
  } catch (error) {
    console.error('Get user by id error:', error)
    res.status(500).json({ error: 'Failed to get user' })
  }
}

export const upgradeFacility = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id
    const { type } = req.body as { type: 'training' | 'warehouse' }

    if (!userId || (type !== 'training' && type !== 'warehouse')) {
      res.status(400).json({ error: 'Invalid request' })
      return
    }

    const user = await User.findById(userId)
    if (!user) {
      res.status(404).json({ error: 'User not found' })
      return
    }

    const currentLevel = type === 'training' ? user.facility.trainingLevel : user.facility.warehouseLevel
    const cost = Math.max(1, currentLevel) * 10

    if (user.tokens < cost) {
      res.status(400).json({ error: 'Not enough tokens', required: cost, available: user.tokens })
      return
    }

    // Apply upgrade
    if (type === 'training') {
      user.facility.trainingLevel = currentLevel + 1
    } else {
      user.facility.warehouseLevel = currentLevel + 1
    }
    user.tokens -= cost

    // Award one unallocated stat point depending on facility type
    if (type === 'training') {
      const driver = await Driver.findById(user.driverId)
      if (driver) {
        driver.statPointsAvailable += 1
        await driver.save()
      }
    } else {
      const car = await Car.findById(user.carId)
      if (car) {
        car.statPointsAvailable += 1
        await car.save()
      }
    }

    await user.save()

    // Return updated snapshot
    const driver = await Driver.findById(user.driverId)
    const car = await Car.findById(user.carId)

    res.json({
      profile: {
        id: user.id,
        email: user.email,
        username: user.username,
        tokens: user.tokens,
        points: user.points,
        joinedDate: user.joinedDate.toISOString(),
        driverId: user.driverId,
        carId: user.carId,
        profilePic: user.profilePic,
        carPic: user.carPic,
        facility: user.facility
      },
      driver: driver ? {
        id: driver.id,
        userId: driver.userId,
        name: driver.name,
        stats: driver.stats,
        statPointsAvailable: driver.statPointsAvailable
      } : null,
      car: car ? {
        id: car.id,
        userId: car.userId,
        name: car.name,
        stats: car.stats,
        statPointsAvailable: car.statPointsAvailable,
        condition: car.condition
      } : null
    })
  } catch (error) {
    console.error('Upgrade facility error:', error)
    res.status(500).json({ error: 'Failed to upgrade facility' })
  }
}
