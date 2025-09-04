import { Request, Response } from 'express'
import { Driver } from '../models/Driver.js'
import { User } from '../models/User.js'

export const getDriver = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id

    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    const driver = await Driver.findById(user.driverId)
    if (!driver) {
      return res.status(404).json({ error: 'Driver not found' })
    }

    res.json({
      id: driver._id.toString(),
      userId: driver.userId,
      name: driver.name,
      stats: driver.stats,
      statPointsAvailable: driver.statPointsAvailable
    })
  } catch (error) {
    console.error('Get driver error:', error)
    res.status(500).json({ error: 'Failed to get driver' })
  }
}

export const updateDriver = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const { name, stats } = req.body

    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    const driver = await Driver.findById(user.driverId)
    if (!driver) {
      return res.status(404).json({ error: 'Driver not found' })
    }

    // Calculate total stat points used
    const currentStats = driver.stats
    const newStats = stats || currentStats
    
    const totalCurrentPoints = Object.values(currentStats).reduce((sum, val) => sum + val, 0)
    const totalNewPoints = Object.values(newStats).reduce((sum, val) => sum + val, 0)
    const pointsUsed = totalNewPoints - totalCurrentPoints

    // Check if user has enough stat points
    if (pointsUsed > driver.statPointsAvailable) {
      return res.status(400).json({ 
        error: 'Not enough stat points available',
        available: driver.statPointsAvailable,
        required: pointsUsed
      })
    }

    // Validate stat ranges
    for (const [key, value] of Object.entries(newStats)) {
      if (value < 0 || value > 100) {
        return res.status(400).json({ 
          error: `${key} must be between 0 and 100` 
        })
      }
    }

    // Update driver
    if (name) driver.name = name
    if (stats) {
      driver.stats = { ...driver.stats, ...stats }
      driver.statPointsAvailable -= pointsUsed
    }

    await driver.save()

    res.json({
      id: driver._id.toString(),
      userId: driver.userId,
      name: driver.name,
      stats: driver.stats,
      statPointsAvailable: driver.statPointsAvailable
    })
  } catch (error) {
    console.error('Update driver error:', error)
    res.status(500).json({ error: 'Failed to update driver' })
  }
}
