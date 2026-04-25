import { Router } from 'express'
import bcrypt from 'bcryptjs'
import prisma from '../lib/prisma'
import { generateToken } from '../middleware/auth'

const router = Router()

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' })
    }

    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const isValidPassword = await bcrypt.compare(password, user.password)

    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

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
    console.error('Login error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

// Get current user
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
      return res.status(401).json({ message: 'No token provided' })
    }

    const jwt = await import('jsonwebtoken')
    const decoded = jwt.default.verify(token, process.env.JWT_SECRET || 'smartseason-secret-key-change-in-production') as { id: number }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, name: true, role: true }
    })

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role.toLowerCase()
    })
  } catch (error) {
    res.status(403).json({ message: 'Invalid token' })
  }
})

export default router