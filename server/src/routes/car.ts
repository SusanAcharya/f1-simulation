import { Router } from 'express'
import { getCar, updateCar, repairCar, boostCarCondition } from '../controllers/carController.js'
import { authenticateToken } from '../middleware/auth.js'
import { validateCarUpdate } from '../middleware/validation.js'

const router = Router()

// All car routes require authentication
router.use(authenticateToken)

router.get('/', getCar)
router.put('/', validateCarUpdate, updateCar)
router.post('/repair', repairCar)
router.post('/boost-condition', boostCarCondition)

export default router
