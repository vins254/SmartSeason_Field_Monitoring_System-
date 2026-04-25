import { Router } from 'express'
import bcrypt from 'bcryptjs'
import prisma from '../lib/prisma'
import { AuthRequest } from '../middleware/auth'

const router = Router()

// Get all users (admin only)
router.get('/', async (req: AuthRequest, res) => {
  try {
    if (req.user?.role?.toLowerCase() !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' })
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    })

    res.json(users.map((u: any) => ({
      ...u,
      role: u.role.toLowerCase()
    })))
  } catch (error) {
    console.error('Get users error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

// Create user (admin only)
router.post('/', async (req: AuthRequest, res) => {
  try {
    if (req.user?.role?.toLowerCase() !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' })
    }

    const { email, password, name, role } = req.body

    if (!email || !password || !name || !role) {
      return res.status(400).json({ message: 'All fields are required' })
    }

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: role.toUpperCase() as any
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true
      }
    })

    res.status(201).json({
      ...user,
      role: user.role.toLowerCase()
    })
  } catch (error) {
    console.error('Create user error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

// Delete user (admin only)
router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    if (req.user?.role?.toLowerCase() !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' })
    }

    const { id } = req.params
    const userId = parseInt(id)

    // Cannot delete yourself
    if (userId === req.user?.id) {
      return res.status(400).json({ message: 'Cannot delete your own account' })
    }

    await prisma.user.delete({
      where: { id: userId }
    })

    res.json({ message: 'User deleted successfully' })
  } catch (error) {
    console.error('Delete user error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

// Get agents for field assignment
router.get('/agents', async (req: AuthRequest, res) => {
  try {
    if (req.user?.role?.toLowerCase() !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' })
    }

    const agents = await prisma.user.findMany({
      where: { role: 'AGENT' },
      select: {
        id: true,
        name: true,
        email: true
      },
      orderBy: { name: 'asc' }
    })

    res.json(agents)
  } catch (error) {
    console.error('Get agents error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

export default router