import { Router } from 'express'
import { getCurrentRace, getDemoRace, getRace, joinRace, simulateRace, completeRace, getRaceHistory } from '../controllers/raceController.js'
import { authenticateToken } from '../middleware/auth.js'

const router = Router()

// Public routes
router.get('/current', getCurrentRace)
router.get('/demo', getDemoRace)
router.get('/:id', getRace)

// Protected routes
router.use(authenticateToken)
router.get('/history', getRaceHistory)
router.post('/join', joinRace)
router.post('/:id/simulate', simulateRace)
router.post('/:id/complete', completeRace)

export default router
