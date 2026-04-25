/**
 * Authentication Middleware
 * 
 * This file handles security by verifying JSON Web Tokens (JWT).
 * It ensures that only logged-in users can access protected API routes.
 */

import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

// In a real app, this MUST be a long, random string stored in your .env file.
const JWT_SECRET = process.env.JWT_SECRET || 'smartseason-secret-key-change-in-production'

export interface AuthRequest extends Request {
  user?: {
    id: number
    email: string
    role: string
  }
}

/**
 * Middleware: authenticateToken
 * This function intercepts requests and checks the 'Authorization' header.
 * If the token is valid, it attaches the user's data to the request object.
 */
export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization']
  // The header usually looks like "Bearer <token>"
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ message: 'Authentication required. Please log in.' })
  }

  try {
    // Verify that the token hasn't been tampered with and hasn't expired.
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number; email: string; role: string }
    req.user = decoded
    next() // Proceed to the actual route handler
  } catch (error) {
    // This happens if the token is old, fake, or if the server secret changed.
    return res.status(403).json({ message: 'Your session has expired or is invalid. Please log in again.' })
  }
}

/**
 * Utility: generateToken
 * Creates a new JWT token for a user after a successful login.
 * Valid for 24 hours.
 */
export function generateToken(user: { id: number; email: string; role: string }) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '24h' }
  )
}