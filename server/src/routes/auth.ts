/**
 * Authentication Entry Points
 * 
 * This router manages the secure gates of our application.
 * It handles identity verification and session generation.
 * 
 * Processes:
 * 1. Login: Verifies credentials against hashed database records.
 * 2. Token Issuance: Generates signed JWTs for valid users.
 * 3. Identity Retrieval (/me): Validates a token and returns the owner's profile.
 */

import { Router } from 'express'
import bcrypt from 'bcryptjs'
import prisma from '../lib/prisma'
import { generateToken } from '../middleware/auth'

const router = Router()

/**
 * POST /api/auth/login
 * The primary entry point for users to gain system access.
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    // Basic Input Validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Both email and password are required to proceed.' })
    }

    // Identity Lookup
    const user = await prisma.user.findUnique({
      where: { email }
    })

    // Security Note: We use generic "Invalid credentials" to prevent account enumeration.
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials. Please check your email and password.' })
    }

    /**
     * Password Verification
     * We NEVER store plain passwords. We compare the provided string 
     * against the salted hash in our database using bcrypt.
     */
    const isValidPassword = await bcrypt.compare(password, user.password)

    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials. Please check your email and password.' })
    }

    // Success: Generate a 24-hour access token
    const token = generateToken({ id: user.id, email: user.email, role: user.role })

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role.toLowerCase()
      }
    })
  } catch (error) {
    // Log detailed errors for server-side debugging but hide them from the client in production.
    console.error('SECURE LOGIN FAILURE:', {
      message: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined
    })
    res.status(500).json({ 
      message: 'A critical internal error occurred during authentication.',
      error: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined
    })
  }
})

/**
 * GET /api/auth/me
 * Used by the frontend to refresh user state when the page reloads.
 * It validates the stored JWT and returns the current user's profile.
 */
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
      return res.status(401).json({ message: 'Session token missing.' })
    }

    // Dynamic import of jsonwebtoken for verification
    const jwt = await import('jsonwebtoken')
    const decoded = jwt.default.verify(token, process.env.JWT_SECRET || 'smartseason-secret-key-change-in-production') as { id: number }

    // Fetch the freshest user data from the DB
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, name: true, role: true }
    })

    if (!user) {
      return res.status(404).json({ message: 'Account no longer exists.' })
    }

    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role.toLowerCase()
    })
  } catch (error) {
    // This happens if the token is forged or expired.
    res.status(403).json({ message: 'Session expired or invalid.' })
  }
})

export default router