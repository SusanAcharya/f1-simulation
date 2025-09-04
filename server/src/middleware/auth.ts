import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { User } from '../models/User.js'
import type { JwtPayload } from '../types/auth.js'

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string
    username: string
    email: string
  }
}

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization
    const token = authHeader && authHeader.split(' ')[1] // Bearer TOKEN

    if (!token) {
      res.status(401).json({ error: 'Access token required' })
      return
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload
    
    // Verify user still exists
    const user = await User.findById(decoded.userId).select('_id username email')
    if (!user) {
      res.status(401).json({ error: 'User not found' })
      return
    }

    req.user = {
      id: user.id,
      username: user.username,
      email: user.email
    }

    next()
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(403).json({ error: 'Invalid token' })
      return
    }
    res.status(500).json({ error: 'Authentication error' })
  }
}
