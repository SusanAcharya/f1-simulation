import { Router } from 'express'
import { register, login, getProfile, updateUserPictures, getUserById, upgradeFacility } from '../controllers/authController.js'
import { authenticateToken } from '../middleware/auth.js'
import { validateLogin, validateRegister } from '../middleware/validation.js'

const router = Router()

// Public routes
router.post('/register', validateRegister, register)
router.post('/login', validateLogin, login)

// Protected routes
router.get('/profile', authenticateToken, getProfile)
router.put('/pictures', authenticateToken, updateUserPictures)
router.post('/facility/upgrade', authenticateToken, upgradeFacility)

// Public user profile by ID
router.get('/user/:id', getUserById)

export default router
