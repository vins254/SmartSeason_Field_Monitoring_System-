import { Router } from 'express'
import prisma from '../lib/prisma'
import { AuthRequest } from '../middleware/auth'

const router = Router()

// Get all users (admin only)
router.get('/', async (req: AuthRequest, res) => {
  try {
    if (req.user?.role?.toLowerCase() !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' })
    }

    const roleParam = req.query.role as string

    let users
    if (roleParam) {
      users = await prisma.user.findMany({
        where: { role: roleParam.toUpperCase() as any },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' }
      })
    } else {
      users = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' }
      })
    }

    res.json(users.map((u: any) => ({
      ...u,
      role: u.role.toLowerCase()
    })))
  } catch (error) {
    console.error('Get users error:', error)
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