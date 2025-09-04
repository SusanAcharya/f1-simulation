import { Request, Response } from 'express'
import { Car } from '../models/Car.js'
import { User } from '../models/User.js'

export const getCar = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id

    const user = await User.findById(userId)
    if (!user) {
      res.status(404).json({ error: 'User not found' })
      return
    }

    const car = await Car.findById(user.carId)
    if (!car) {
      res.status(404).json({ error: 'Car not found' })
      return
    }

    res.json({
      id: car.id,
      userId: car.userId,
      name: car.name,
      stats: car.stats,
      statPointsAvailable: car.statPointsAvailable,
      condition: car.condition
    })
  } catch (error) {
    console.error('Get car error:', error)
    res.status(500).json({ error: 'Failed to get car' })
  }
}

export const updateCar = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id
    const { name, stats } = req.body

    const user = await User.findById(userId)
    if (!user) {
      res.status(404).json({ error: 'User not found' })
      return
    }

    const car = await Car.findById(user.carId)
    if (!car) {
      res.status(404).json({ error: 'Car not found' })
      return
    }

    // Calculate total stat points used
    const currentStats = car.stats
    const newStats = stats || currentStats
    
    const totalCurrentPoints = Object.values(currentStats).reduce((sum: number, val: any) => sum + val, 0)
    const totalNewPoints = Object.values(newStats).reduce((sum: number, val: any) => sum + val, 0)
    const pointsUsed = totalNewPoints - totalCurrentPoints

    // Check if user has enough stat points
    if (pointsUsed > car.statPointsAvailable) {
      res.status(400).json({ 
        error: 'Not enough stat points available',
        available: car.statPointsAvailable,
        required: pointsUsed
      })
      return
    }

    // Validate stat ranges
    for (const [key, value] of Object.entries(newStats)) {
      if ((value as number) < 0 || (value as number) > 100) {
        res.status(400).json({ 
          error: `${key} must be between 0 and 100` 
        })
        return
      }
    }

    // Update car
    if (name) car.name = name
    if (stats) {
      car.stats = { ...car.stats, ...stats }
      car.statPointsAvailable -= pointsUsed
    }

    await car.save()

    res.json({
      id: car.id,
      userId: car.userId,
      name: car.name,
      stats: car.stats,
      statPointsAvailable: car.statPointsAvailable,
      condition: car.condition
    })
  } catch (error) {
    console.error('Update car error:', error)
    res.status(500).json({ error: 'Failed to update car' })
  }
}

export const repairCar = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id
    const { cost } = req.body

    const user = await User.findById(userId)
    if (!user) {
      res.status(404).json({ error: 'User not found' })
      return
    }

    const car = await Car.findById(user.carId)
    if (!car) {
      res.status(404).json({ error: 'Car not found' })
      return
    }

    // Check if user has enough tokens
    if (user.tokens < cost) {
      res.status(400).json({ 
        error: 'Not enough tokens',
        available: user.tokens,
        required: cost
      })
      return
    }

    // Calculate repair amount (cost in tokens = condition points restored)
    const conditionToRestore = Math.min(cost, 100 - car.condition)
    
    if (conditionToRestore <= 0) {
      res.status(400).json({ error: 'Car is already at maximum condition' })
      return
    }

    // Update car condition and user tokens
    car.condition += conditionToRestore
    user.tokens -= cost

    await car.save()
    await user.save()

    res.json({
      id: car.id,
      userId: car.userId,
      name: car.name,
      stats: car.stats,
      statPointsAvailable: car.statPointsAvailable,
      condition: car.condition,
      tokensSpent: cost,
      conditionRestored: conditionToRestore
    })
  } catch (error) {
    console.error('Repair car error:', error)
    res.status(500).json({ error: 'Failed to repair car' })
  }
}

export const boostCarCondition = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id
    const { tokens } = req.body

    const user = await User.findById(userId)
    if (!user) {
      res.status(404).json({ error: 'User not found' })
      return
    }

    const car = await Car.findById(user.carId)
    if (!car) {
      res.status(404).json({ error: 'Car not found' })
      return
    }

    // Check if user has enough tokens
    if (user.tokens < tokens) {
      res.status(400).json({ 
        error: 'Not enough tokens',
        available: user.tokens,
        required: tokens
      })
      return
    }

    // Calculate boost amount (10 tokens = 10% condition boost)
    const conditionBoost = Math.min(tokens, 100 - car.condition)
    
    if (conditionBoost <= 0) {
      res.status(400).json({ error: 'Car is already at maximum condition' })
      return
    }

    // Update car condition and user tokens
    car.condition += conditionBoost
    user.tokens -= tokens

    await car.save()
    await user.save()

    res.json({
      id: car.id,
      userId: car.userId,
      name: car.name,
      stats: car.stats,
      statPointsAvailable: car.statPointsAvailable,
      condition: car.condition,
      tokensSpent: tokens,
      conditionBoosted: conditionBoost
    })
  } catch (error) {
    console.error('Boost car condition error:', error)
    res.status(500).json({ error: 'Failed to boost car condition' })
  }
}
