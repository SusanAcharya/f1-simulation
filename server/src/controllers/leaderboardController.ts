import { Request, Response } from 'express'
import { User } from '../models/User.js'
import { Race } from '../models/Race.js'

export const getLeaderboard = async (req: Request, res: Response): Promise<void> => {
  try {
    const { limit = 50 } = req.query

    const users = await User.find({}, 'username points profilePic carPic')
      .sort({ points: -1 })
      .limit(Number(limit))
      .lean()

    // Aggregate races/wins/podiums
    const allCompleted = await Race.find({ status: 'completed' }, 'results').lean()
    const statsMap: Record<string, { races: number; wins: number; podiums: number }> = {}
    for (const r of allCompleted) {
      for (const res of r.results || []) {
        const uid = res.userId
        if (!statsMap[uid]) statsMap[uid] = { races: 0, wins: 0, podiums: 0 }
        statsMap[uid].races += 1
        if (res.position === 1) statsMap[uid].wins += 1
        if (res.position <= 3) statsMap[uid].podiums += 1
      }
    }

    const leaderboard = users.map((user, index) => {
      const base = statsMap[user._id.toString()] || { races: 0, wins: 0, podiums: 0 }
      return {
        userId: user._id.toString(),
        username: user.username,
        points: user.points,
        position: index + 1,
        profilePic: user.profilePic || 1,
        carPic: user.carPic || 1,
        races: base.races,
        wins: base.wins,
        podiums: base.podiums
      }
    })

    res.json(leaderboard)
  } catch (error) {
    console.error('Get leaderboard error:', error)
    res.status(500).json({ error: 'Failed to get leaderboard' })
  }
}

export const getUserRank = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id

    const user = await User.findById(userId, 'username points')
    if (!user) {
      res.status(404).json({ error: 'User not found' })
      return
    }

    // Count users with more points than current user
    const rank = await User.countDocuments({ points: { $gt: user.points } }) + 1

    res.json({
      userId: user.id,
      username: user.username,
      points: user.points,
      position: rank
    })
  } catch (error) {
    console.error('Get user rank error:', error)
    res.status(500).json({ error: 'Failed to get user rank' })
  }
}
