import { Router } from 'express'
import prisma from '../lib/prisma'
import { AuthRequest } from '../middleware/auth'

const router = Router()

/**
 * Utility to reliably extract the field ID from request parameters.
 * Sometimes Express gives us an array or a string, so we ensure it's a clean integer.
 */
function getFieldId(id: string | string[]): number {
  return parseInt(Array.isArray(id) ? id[0] : id)
}

/**
 * Main GET endpoint for fields.
 * Here's the clever part: we check the user's role. 
 * If they're an admin, they get everything. 
 * If they're an agent, the query automatically filters to only show what's assigned to them.
 */
router.get('/', async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id
    const userRole = req.user?.role?.toLowerCase()

    const where = userRole === 'admin' 
      ? {} 
      : { agentId: userId }

    const fields = await prisma.field.findMany({
      where,
      include: {
        agent: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: { updatedAt: 'desc' }
    })

    /**
     * Before sending data to the frontend, we calculate the "Health Status" on the fly.
     * We also format the DB enums (like HARVEST_READY) into human-readable text (Harvest Ready).
     */
    const fieldsWithStatus = fields.map(field => {
      const statusValue = computeFieldStatus(field)
      return {
        ...field,
        stage: formatEnum(field.stage),
        status: formatEnum(statusValue),
        agentName: field.agent?.name
      }
    })

    res.json(fieldsWithStatus)
  } catch (error) {
    console.error('Get fields error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

// Get single field
router.get('/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params
    const fieldId = getFieldId(id)
    const userId = req.user?.id
    const userRole = req.user?.role?.toLowerCase()

    const field = await prisma.field.findUnique({
      where: { id: fieldId },
      include: {
        agent: {
          select: { id: true, name: true, email: true }
        }
      }
    })

    if (!field) {
      return res.status(404).json({ message: 'Field not found' })
    }

    // Check access
    if (userRole !== 'admin' && field.agentId !== userId) {
      return res.status(403).json({ message: 'Access denied' })
    }

    const statusValue = computeFieldStatus(field)

    res.json({
      ...field,
      stage: formatEnum(field.stage),
      status: formatEnum(statusValue),
      agentName: field.agent?.name
    })
  } catch (error) {
    console.error('Get field error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

// Create field (admin only)
router.post('/', async (req: AuthRequest, res) => {
  try {
    if (req.user?.role?.toLowerCase() !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' })
    }

    const { name, cropType, plantingDate, stage, agentId } = req.body

    if (!name || !cropType || !plantingDate || !agentId) {
      return res.status(400).json({ message: 'Name, crop type, planting date, and agent assignment are required' })
    }

    const field = await prisma.field.create({
      data: {
        name,
        cropType,
        plantingDate: new Date(plantingDate),
        stage: stage || 'PLANTED',
        agentId: agentId || null
      },
      include: {
        agent: {
          select: { id: true, name: true, email: true }
        }
      }
    })

    const statusValue = computeFieldStatus(field)

    res.status(201).json({
      ...field,
      stage: formatEnum(field.stage),
      status: formatEnum(statusValue),
      agentName: field.agent?.name
    })
  } catch (error) {
    console.error('Create field error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

// Update field (admin only)
router.put('/:id', async (req: AuthRequest, res) => {
  try {
    if (req.user?.role?.toLowerCase() !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' })
    }

    const { id } = req.params
    const { name, cropType, plantingDate, stage, agentId } = req.body
    const fieldId = getFieldId(id)

    const existingField = await prisma.field.findUnique({
      where: { id: fieldId }
    })

    if (!existingField) {
      return res.status(404).json({ message: 'Field not found' })
    }

    const field = await prisma.field.update({
      where: { id: fieldId },
      data: {
        ...(name && { name }),
        ...(cropType && { cropType }),
        ...(plantingDate && { plantingDate: new Date(plantingDate) }),
        ...(stage && { stage: stage.toUpperCase() }),
        ...(agentId !== undefined && { agentId: agentId || null })
      },
      include: {
        agent: {
          select: { id: true, name: true, email: true }
        }
      }
    })

    const statusValue = computeFieldStatus(field)

    res.json({
      ...field,
      stage: formatEnum(field.stage),
      status: formatEnum(statusValue),
      agentName: field.agent?.name
    })
  } catch (error) {
    console.error('Update field error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

// Delete field (admin only)
router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    if (req.user?.role?.toLowerCase() !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' })
    }

    const { id } = req.params
    const fieldId = getFieldId(id)

    const existingField = await prisma.field.findUnique({
      where: { id: fieldId }
    })

    if (!existingField) {
      return res.status(404).json({ message: 'Field not found' })
    }

    await prisma.field.delete({
      where: { id: fieldId }
    })

    res.json({ message: 'Field deleted successfully' })
  } catch (error) {
    console.error('Delete field error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

// Get field updates
router.get('/:id/updates', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params
    const fieldId = getFieldId(id)
    const userId = req.user?.id
    const userRole = req.user?.role?.toLowerCase()

    const field = await prisma.field.findUnique({
      where: { id: fieldId }
    })

    if (!field) {
      return res.status(404).json({ message: 'Field not found' })
    }

    // Check access
    if (userRole !== 'admin' && field.agentId !== userId) {
      return res.status(403).json({ message: 'Access denied' })
    }

    const updates = await prisma.fieldUpdate.findMany({
      where: { fieldId: fieldId },
      include: {
        user: {
          select: { name: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    res.json(updates.map(u => ({
      ...u,
      stage: formatEnum(u.stage),
      userName: u.user.name
    })))
  } catch (error) {
    console.error('Get field updates error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

// Create field update (agent can update their assigned fields)
router.post('/:id/updates', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params
    const fieldId = getFieldId(id)
    const { stage, notes } = req.body
    const userId = req.user?.id

    const field = await prisma.field.findUnique({
      where: { id: fieldId }
    })

    if (!field) {
      return res.status(404).json({ message: 'Field not found' })
    }

    // Check access - admin can update any field, agent can only update their assigned fields
    if (req.user?.role?.toLowerCase() !== 'admin' && field.agentId !== userId) {
      return res.status(403).json({ message: 'Access denied' })
    }

    if (!stage) {
      return res.status(400).json({ message: 'Stage is required' })
    }

    // Create the update
    const update = await prisma.fieldUpdate.create({
      data: {
        fieldId: fieldId,
        userId: userId!,
        stage,
        notes: notes || null
      },
      include: {
        user: {
          select: { name: true }
        }
      }
    })

    // Update the field stage
    await prisma.field.update({
      where: { id: fieldId },
      data: {
        stage: stage.toUpperCase()
      }
    })

    res.status(201).json({
      ...update,
      stage: formatEnum(update.stage),
      userName: update.user.name
    })
  } catch (error) {
    console.error('Create field update error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

/**
 * This is our automated "Field Health" checker.
 * Instead of storing the status (Active/At Risk) in the database, we calculate it 
 * whenever the data is fetched. This prevents the data from becoming stale.
 */
function computeFieldStatus(field: { stage: string; updatedAt: Date }) {
  const now = new Date()
  const daysSinceUpdate = Math.floor((now.getTime() - new Date(field.updatedAt).getTime()) / (1000 * 60 * 60 * 24))

  // Once a field is harvested, we consider the cycle "Completed"
  if (field.stage === 'HARVESTED') {
    return 'COMPLETED'
  }

  // Our policy is that a field needs an update at least every 14 days.
  // If an agent hasn't checked in for 2 weeks, we flag it as "At Risk" so the admin can follow up.
  if (daysSinceUpdate > 14) {
    return 'AT_RISK'
  }


  // Otherwise, active
  return 'ACTIVE'
}

// Format enum value to Title Case (e.g. READY -> Ready, AT_RISK -> At Risk)
function formatEnum(val: string) {
  if (!val) return val
  return val.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')
}

export default router