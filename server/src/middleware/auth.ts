import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'smartseason-secret-key-change-in-production'

export interface AuthRequest extends Request {
  user?: {
    id: number
    email: string
    role: string
  }
}

export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ message: 'Access token required' })
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number; email: string; role: string }
    req.user = decoded
    next()
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired token' })
  }
}

export function generateToken(user: { id: number; email: string; role: string }) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '24h' }
  )
}