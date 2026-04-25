/**
 * Fields Management Routes
 * 
 * This router handles the full lifecycle of agricultural fields.
 * It implements Role-Based Access Control (RBAC):
 * - Admins: Full CRUD access to all fields.
 * - Agents: Can only view and update fields assigned to them.
 */

import { Router } from 'express'
import prisma from '../lib/prisma'
import { AuthRequest } from '../middleware/auth'

const router = Router()

/**
 * Utility: Extract a clean Integer ID from request params.
 * Express params can sometimes be unpredictable, so this ensures we have 
 * a valid database ID before performing queries.
 */
function getFieldId(id: string | string[]): number {
  return parseInt(Array.isArray(id) ? id[0] : id)
}

/**
 * GET /api/fields
 * Retrieve a list of fields based on user permissions.
 */
router.get('/', async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id
    const userRole = req.user?.role?.toLowerCase()

    // Smart Filtering: 
    // Admins see everything. Agents only see fields where they are the assigned 'agentId'.
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
     * Data Transformation Layer
     * Before sending data to the frontend, we calculate the "Health Status" 
     * and format database enums into human-friendly strings.
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
    console.error('FETCH FIELDS ERROR:', error)
    res.status(500).json({ message: 'Failed to retrieve fields' })
  }
})

/**
 * GET /api/fields/:id
 * Fetch details for a specific field, including its assigned agent.
 */
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

    // Security Check: Agents can't peek at fields they aren't assigned to.
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
    console.error('GET FIELD ERROR:', error)
    res.status(500).json({ message: 'Error retrieving field details' })
  }
})

/**
 * POST /api/fields
 * Create a new monitoring target (Admin Only).
 */
router.post('/', async (req: AuthRequest, res) => {
  try {
    if (req.user?.role?.toLowerCase() !== 'admin') {
      return res.status(403).json({ message: 'Only administrators can create fields' })
    }

    const { name, cropType, plantingDate, stage, agentId } = req.body

    // Validation: Ensure we have the bare minimum to start tracking
    if (!name || !cropType || !plantingDate || !agentId) {
      return res.status(400).json({ message: 'Please provide name, crop type, planting date, and an assigned agent' })
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
    console.error('CREATE FIELD ERROR:', error)
    res.status(500).json({ message: 'Failed to create new field' })
  }
})

/**
 * PUT /api/fields/:id
 * Update field metadata (Admin Only).
 */
router.put('/:id', async (req: AuthRequest, res) => {
  try {
    if (req.user?.role?.toLowerCase() !== 'admin') {
      return res.status(403).json({ message: 'Admin access required for modifications' })
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
    console.error('UPDATE FIELD ERROR:', error)
    res.status(500).json({ message: 'Failed to update field' })
  }
})

/**
 * DELETE /api/fields/:id
 * Permanently remove a field (Admin Only).
 */
router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    if (req.user?.role?.toLowerCase() !== 'admin') {
      return res.status(403).json({ message: 'Admin access required for deletion' })
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

    res.json({ message: 'Field successfully archived and removed from tracking' })
  } catch (error) {
    console.error('DELETE FIELD ERROR:', error)
    res.status(500).json({ message: 'Failed to delete field' })
  }
})

/**
 * GET /api/fields/:id/updates
 * Get the full history of monitoring reports for a field.
 */
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

    // Access Check
    if (userRole !== 'admin' && field.agentId !== userId) {
      return res.status(403).json({ message: 'Access denied to history' })
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
    console.error('HISTORY FETCH ERROR:', error)
    res.status(500).json({ message: 'Error retrieving field update history' })
  }
})

/**
 * POST /api/fields/:id/updates
 * Submit a new monitoring report (The core task for Agents).
 */
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

    // Permission: Only the assigned agent or an admin can file an update report.
    if (req.user?.role?.toLowerCase() !== 'admin' && field.agentId !== userId) {
      return res.status(403).json({ message: 'You are not assigned to this field' })
    }

    if (!stage) {
      return res.status(400).json({ message: 'Please select the current growth stage' })
    }

    // 1. Create the update record (Audit Trail)
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

    // 2. Sync the current field stage with the latest report
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
    console.error('UPDATE SUBMISSION ERROR:', error)
    res.status(500).json({ message: 'Failed to record field update' })
  }
})

/**
 * --- AUTOMATED FIELD HEALTH LOGIC ---
 * 
 * We use this to calculate the 'Status' badge you see in the UI.
 * Rules:
 * 1. If Stage = HARVESTED -> Status is 'Completed'.
 * 2. If no update for > 14 days -> Status is 'At Risk' (Alert the Admin!).
 * 3. Otherwise -> Status is 'Active'.
 */
function computeFieldStatus(field: { stage: string; updatedAt: Date }) {
  const now = new Date()
  const daysSinceUpdate = Math.floor((now.getTime() - new Date(field.updatedAt).getTime()) / (1000 * 60 * 60 * 24))

  if (field.stage === 'HARVESTED') {
    return 'COMPLETED'
  }

  // Critical Assumption: Monitoring happens bi-weekly at minimum.
  if (daysSinceUpdate > 14) {
    return 'AT_RISK'
  }

  return 'ACTIVE'
}

/**
 * Utility: Format Enum Strings for humans.
 * e.g. HARVEST_READY -> Harvest Ready
 */
function formatEnum(val: string) {
  if (!val) return val
  return val.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')
}

export default router