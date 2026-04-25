/**
 * User Management Routes
 * 
 * This router handles the administration of the internal team.
 * It is exclusively for Admin use and allows complete lifecycle 
 * management of both Administrator and Field Agent accounts.
 * 
 * Features:
 * 1. Roster Retrieval: Get all team members.
 * 2. Onboarding: Create new secure accounts with hashed passwords.
 * 3. Profiles: Retrieve and Update individual user data.
 * 4. Offboarding: Permanently remove users (with self-deletion protection).
 * 5. Assignment Helper: A specialized list of agents for field allocation.
 */

import { Router } from 'express'
import bcrypt from 'bcryptjs'
import prisma from '../lib/prisma'
import { AuthRequest } from '../middleware/auth'

const router = Router()

/**
 * Utility: getUserId
 * Ensures we always have a clean Integer for database lookups, 
 * regardless of how Express passes the route parameter.
 */
function getUserId(id: any): number {
  const val = Array.isArray(id) ? id[0] : id
  return parseInt(val)
}

/**
 * GET /api/users
 * Returns the full list of all registered accounts.
 */
router.get('/', async (req: AuthRequest, res) => {
  try {
    // SECURITY: Verify the requester is actually an Admin.
    if (req.user?.role?.toLowerCase() !== 'admin') {
      return res.status(403).json({ message: 'Administrative privileges required to view the team roster.' })
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

    // Formatting: Normalize roles to lowercase for frontend consistency
    res.json(users.map((u: any) => ({
      ...u,
      role: u.role.toLowerCase()
    })))
  } catch (error) {
    console.error('TEAM ROSTER ERROR:', error)
    res.status(500).json({ message: 'Failed to retrieve team members.' })
  }
})

/**
 * POST /api/users
 * Register a new team member with a secure password.
 */
router.post('/', async (req: AuthRequest, res) => {
  try {
    if (req.user?.role?.toLowerCase() !== 'admin') {
      return res.status(403).json({ message: 'Only administrators can register new members.' })
    }

    const { email, password, name, role } = req.body

    // Validation: All fields are mandatory for new accounts
    if (!email || !password || !name || !role) {
      return res.status(400).json({ message: 'Please provide email, password, name, and role.' })
    }

    // Check for collision: Emails must be unique
    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return res.status(400).json({ message: 'This email is already registered to another team member.' })
    }

    // Security: Salt and Hash the password before it ever touches the database
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
    console.error('USER CREATION ERROR:', error)
    res.status(500).json({ message: 'Failed to create new user account.' })
  }
})

/**
 * GET /api/users/:id
 * Fetch the profile details for a single user.
 */
router.get('/:id', async (req: AuthRequest, res) => {
  try {
    if (req.user?.role?.toLowerCase() !== 'admin') {
      return res.status(403).json({ message: 'Access denied.' })
    }

    const id = req.params.id as string
    const userId = getUserId(id)

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      }
    })

    if (!user) {
      return res.status(404).json({ message: 'Member profile not found.' })
    }

    res.json({
      ...user,
      role: user.role.toLowerCase()
    })
  } catch (error) {
    console.error('FETCH USER ERROR:', error)
    res.status(500).json({ message: 'Error retrieving profile.' })
  }
})

/**
 * PUT /api/users/:id
 * Update an existing user's profile or change their password.
 */
router.put('/:id', async (req: AuthRequest, res) => {
  try {
    if (req.user?.role?.toLowerCase() !== 'admin') {
      return res.status(403).json({ message: 'Administrative access required for profile modifications.' })
    }

    const id = req.params.id as string
    const userId = getUserId(id)
    const { email, password, name, role } = req.body

    const existingUser = await prisma.user.findUnique({ where: { id: userId } })
    if (!existingUser) {
      return res.status(404).json({ message: 'User not found.' })
    }

    // Build update object dynamically
    const updateData: any = {}
    if (email) updateData.email = email
    if (name) updateData.name = name
    if (role) updateData.role = role.toUpperCase()
    
    // Only re-hash if a new password was actually provided
    if (password) {
      updateData.password = await bcrypt.hash(password, 10)
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true
      }
    })

    res.json({
      ...user,
      role: user.role.toLowerCase()
    })
  } catch (error) {
    console.error('UPDATE USER ERROR:', error)
    res.status(500).json({ message: 'Failed to update user records.' })
  }
})


/**
 * DELETE /api/users/:id
 * Revoke access by removing the user account.
 */
router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    if (req.user?.role?.toLowerCase() !== 'admin') {
      return res.status(403).json({ message: 'Administrative access required for deletion.' })
    }

    const id = req.params.id as string
    const userId = getUserId(id)

    // Security check: Never let an admin delete themselves (this would lock them out)
    if (userId === req.user?.id) {
      return res.status(400).json({ message: 'Self-deletion is prohibited. Ask another admin to remove your account if necessary.' })
    }

    await prisma.user.delete({
      where: { id: userId }
    })

    res.json({ message: 'User account successfully deactivated and removed.' })
  } catch (error) {
    console.error('DELETE USER ERROR:', error)
    res.status(500).json({ message: 'Failed to remove user account.' })
  }
})

/**
 * GET /api/users/agents
 * Specialized helper route: Returns a lightweight list of only Agents.
 * Used for populating field assignment dropdowns.
 */
router.get('/agents', async (req: AuthRequest, res) => {
  try {
    if (req.user?.role?.toLowerCase() !== 'admin') {
      return res.status(403).json({ message: 'Access denied.' })
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
    console.error('GET AGENTS HELPER ERROR:', error)
    res.status(500).json({ message: 'Failed to retrieve agent list.' })
  }
})

export default router