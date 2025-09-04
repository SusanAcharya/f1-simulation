import { Request, Response, NextFunction } from 'express'
import { body, validationResult } from 'express-validator'

export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    })
  }
  next()
}

export const validateLogin = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage('Username must be between 3 and 20 characters'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  handleValidationErrors
]

export const validateRegister = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage('Username must be between 3 and 20 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  handleValidationErrors
]

export const validateDriverUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 30 })
    .withMessage('Driver name must be between 1 and 30 characters'),
  body('stats.cornering')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Cornering must be between 0 and 100'),
  body('stats.overtaking')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Overtaking must be between 0 and 100'),
  body('stats.defending')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Defending must be between 0 and 100'),
  body('stats.aggression')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Aggression must be between 0 and 100'),
  body('stats.composure')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Composure must be between 0 and 100'),
  handleValidationErrors
]

export const validateCarUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 30 })
    .withMessage('Car name must be between 1 and 30 characters'),
  body('stats.speed')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Speed must be between 0 and 100'),
  body('stats.acceleration')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Acceleration must be between 0 and 100'),
  body('stats.braking')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Braking must be between 0 and 100'),
  body('stats.aero')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Aero must be between 0 and 100'),
  body('stats.fuel')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Fuel must be between 0 and 100'),
  body('stats.tireWear')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Tire wear must be between 0 and 100'),
  body('stats.grip')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Grip must be between 0 and 100'),
  body('stats.durability')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Durability must be between 0 and 100'),
  handleValidationErrors
]
