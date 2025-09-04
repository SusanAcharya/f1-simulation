import { Request, Response } from 'express'
import { Race } from '../models/Race.js'
import { User } from '../models/User.js'
import { Driver } from '../models/Driver.js'
import { Car } from '../models/Car.js'

export const getCurrentRace = async (req: Request, res: Response): Promise<void> => {
  try {
    // Get the current active race or the next scheduled race
    let currentRace = await Race.findOne({ 
      status: { $in: ['scheduled', 'in-progress'] }
    }).populate('participants', 'username').lean()

    if (!currentRace) {
      // Create a new race if none exists
      const allUsers = await User.find({}, '_id username')
      
      const newRace = new Race({
        name: `Race ${Date.now()}`,
        track: 'Pixel Speedway Circuit',
        startTime: new Date(Date.now() + 60000), // Start in 1 minute
        participants: allUsers.map((u: any) => u._id.toString()),
        status: 'scheduled'
      })
      
      await newRace.save()
      currentRace = await Race.findById(newRace._id).populate('participants', 'username').lean()
    }

    res.json(currentRace)
  } catch (error) {
    console.error('Get current race error:', error)
    res.status(500).json({ error: 'Failed to get current race' })
  }
}

export const getDemoRace = async (req: Request, res: Response): Promise<void> => {
  try {
    // Get all users with their drivers and cars for the race
    const allUsers = await User.find({}, '_id username profilePic carPic').lean()
    const allDrivers = await Driver.find({}).lean()
    const allCars = await Car.find({}).lean()

    // Create participants array with all users
    const participants = allUsers.map((user: any) => {
      const driver = allDrivers.find(d => d.userId === user._id.toString())
      const car = allCars.find(c => c.userId === user._id.toString())
      
      return {
        id: user._id.toString(),
        userId: user._id.toString(),
        username: user.username,
        profilePic: `/src/assets/profile-pics/profile-pic${user.profilePic || 1}.png`,
        carPic: user.carPic || 1,
        driver: driver || {
          id: `driver-${user._id}`,
          userId: user._id.toString(),
          name: user.username,
          stats: { cornering: 50, overtaking: 50, defending: 50, aggression: 50, composure: 50 },
          statPointsAvailable: 0
        },
        car: car || {
          id: `car-${user._id}`,
          userId: user._id.toString(),
          name: `${user.username}'s Car`,
          stats: { speed: 50, acceleration: 50, braking: 50, aero: 50, fuel: 50, tireWear: 50, grip: 50, durability: 50 },
          statPointsAvailable: 0,
          condition: 100
        }
      }
    })

    // Only use real users from database - no demo participants

    const demoRace = {
      id: 'live-race-1',
      name: 'Pixel Speedway Circuit - Live Race',
      track: 'Circuit 1',
      startTime: new Date(Date.now() + 60000),
      status: 'scheduled',
      participants
    }

    res.json(demoRace)
  } catch (error) {
    console.error('Get demo race error:', error)
    res.status(500).json({ error: 'Failed to get demo race' })
  }
}

export const getRace = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params

    const race = await Race.findById(id)
      .populate('participants', 'username')
      .lean()

    if (!race) {
      res.status(404).json({ error: 'Race not found' })
      return
    }

    res.json(race)
  } catch (error) {
    console.error('Get race error:', error)
    res.status(500).json({ error: 'Failed to get race' })
  }
}

export const joinRace = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id
    const { raceId } = req.body

    const race = await Race.findById(raceId)
    if (!race) {
      res.status(404).json({ error: 'Race not found' })
      return
    }

    if (race.status !== 'scheduled') {
      res.status(400).json({ error: 'Race is not available for joining' })
      return
    }

    if (race.participants.includes(userId)) {
      res.status(400).json({ error: 'Already joined this race' })
      return
    }

    race.participants.push(userId)
    await race.save()

    res.json({ message: 'Successfully joined race', raceId })
  } catch (error) {
    console.error('Join race error:', error)
    res.status(500).json({ error: 'Failed to join race' })
  }
}

export const simulateRace = async (req: Request, res: Response): Promise<void> => {
  try {
    const { raceId } = req.params

    const race = await Race.findById(raceId)
      .populate('participants', 'username')
      .lean()

    if (!race) {
      res.status(404).json({ error: 'Race not found' })
      return
    }

    if (race.status !== 'scheduled') {
      res.status(400).json({ error: 'Race cannot be simulated' })
      return
    }

    // Get all participants' drivers and cars
    const participants = await User.find({ _id: { $in: race.participants } })
    const drivers = await Driver.find({ userId: { $in: race.participants } })
    const cars = await Car.find({ userId: { $in: race.participants } })

    // Enhanced race simulation with lap timing
    const results = race.participants.map(userId => {
      const driver = drivers.find(d => d.userId === userId)
      const car = cars.find(c => c.userId === userId)
      
      if (!driver || !car) {
        return {
          userId,
          position: race.participants.length,
          points: 0,
          time: 999999,
          fastestLap: false,
          retired: true
        }
      }

      // Calculate performance score based on driver and car stats
      const driverScore = (driver.stats.cornering + driver.stats.overtaking + 
                          driver.stats.defending + driver.stats.aggression + 
                          driver.stats.composure) / 5
      
      const carScore = (car.stats.speed + car.stats.acceleration + 
                       car.stats.braking + car.stats.aero + 
                       car.stats.grip + car.stats.durability) / 6
      
      const conditionMultiplier = car.condition / 100
      const totalScore = (driverScore + carScore) * conditionMultiplier
      
      // Add some randomness
      const randomFactor = 0.8 + Math.random() * 0.4 // 0.8 to 1.2
      const finalScore = totalScore * randomFactor

      // Calculate lap times (45 seconds to 1 minute based on performance)
      const baseLapTime = 45000 + (100 - (finalScore || 0)) * 150 // 45s to 60s range
      const lapTimeVariation = Math.random() * 5000 // ±2.5s variation
      const lapTime = Math.max(45000, baseLapTime + lapTimeVariation)
      
      // Total race time for 10 laps
      const totalTime = lapTime * 10

      return {
        userId,
        score: finalScore,
        lapTime: Math.round(lapTime),
        totalTime: Math.round(totalTime),
        fastestLap: false,
        retired: false
      }
    })

    // Sort by score (highest first) and assign positions
    results.sort((a, b) => (b.score || 0) - (a.score || 0))
    
    const raceResults = results.map((result, index) => {
      const position = index + 1
      let points = 0
      let tokens = 0
      let medal = ''
      
      // New reward system
      if (position === 1) {
        points = 15
        tokens = 50
        medal = '🥇'
      } else if (position === 2) {
        points = 12
        tokens = 40
        medal = '🥈'
      } else if (position === 3) {
        points = 10
        tokens = 30
        medal = '🥉'
      } else if (position <= 5) {
        points = 8
        tokens = 25
      } else if (position <= 10) {
        points = 5
        tokens = 20
      } else {
        points = 0
        tokens = 10
      }

      return {
        userId: result.userId,
        position,
        points,
        tokens,
        medal,
        lapTime: result.lapTime,
        totalTime: result.totalTime,
        fastestLap: position === 1,
        retired: result.retired || false
      }
    })

    // Update race with results
    await Race.findByIdAndUpdate(raceId, {
      results: raceResults,
      status: 'completed'
    })

    // Update user points and tokens
    for (const result of raceResults) {
      await User.findByIdAndUpdate(result.userId, {
        $inc: { 
          points: result.points,
          tokens: result.tokens
        }
      })
    }

    res.json({
      message: 'Race simulated successfully',
      results: raceResults
    })
  } catch (error) {
    console.error('Simulate race error:', error)
    res.status(500).json({ error: 'Failed to simulate race' })
  }
}

export const getRaceHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id
    
    // Get all completed races where the user participated
    const races = await Race.find({ 
      status: 'completed',
      'results.userId': userId 
    }).sort({ createdAt: -1 }).limit(20).lean()
    
    const raceHistory = races.map(race => {
      const userResult = race.results?.find((r: any) => r.userId === userId)
      return {
        id: race._id.toString(),
        date: (race as any).createdAt?.toISOString() || new Date().toISOString(),
        track: race.track || 'Unknown Track',
        winner: race.results?.find((r: any) => r.position === 1)?.userId || 'Unknown',
        participants: race.results?.length || 0,
        yourPosition: userResult?.position || 0,
        points: userResult?.points || 0
      }
    })
    
    res.json(raceHistory)
  } catch (error) {
    console.error('Get race history error:', error)
    res.status(500).json({ error: 'Failed to get race history' })
  }
}

export const completeRace = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const { results } = req.body as { results: Array<{ userId: string; position: number; points: number; tokens?: number }> }
    let race = await Race.findById(id)
    if (!race) {
      // Create an ad-hoc completed race if none exists (e.g., demo race)
      race = new Race({
        name: `Live Race ${new Date().toISOString()}`,
        track: 'Pixel Speedway Circuit',
        startTime: new Date(),
        participants: results.map(r => r.userId),
        status: 'completed',
        results: []
      }) as any
    }
    
    if (race) {
      race.results = results.map(r => ({ userId: r.userId, position: r.position, points: r.points, time: 0, fastestLap: r.position === 1 }))
      race.status = 'completed'
      await race.save()
    }

    // Update user totals
    for (const r of results) {
      await User.findByIdAndUpdate(r.userId, {
        $inc: {
          points: r.points,
          tokens: r.tokens || 0
        }
      })
    }

    res.json({ message: 'Race results saved' })
  } catch (error) {
    console.error('Complete race error:', error)
    res.status(500).json({ error: 'Failed to complete race' })
  }
}
