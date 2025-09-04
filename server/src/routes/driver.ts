import { Router } from 'express'
import { getDriver, updateDriver } from '../controllers/driverController.js'
import { authenticateToken } from '../middleware/auth.js'
import { validateDriverUpdate } from '../middleware/validation.js'

const router = Router()

// All driver routes require authentication
router.use(authenticateToken)

router.get('/', getDriver)
router.put('/', validateDriverUpdate, updateDriver)

export default router
