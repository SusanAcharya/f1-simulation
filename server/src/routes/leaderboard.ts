import { Router } from 'express'
import { getLeaderboard, getUserRank } from '../controllers/leaderboardController.js'
import { authenticateToken } from '../middleware/auth.js'

const router = Router()

// Public route
router.get('/', getLeaderboard)

// Protected route
router.get('/my-rank', authenticateToken, getUserRank)

export default router
