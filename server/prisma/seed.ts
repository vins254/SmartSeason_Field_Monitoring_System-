import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@smartseason.com' },
    update: {},
    create: {
      email: 'admin@smartseason.com',
      password: adminPassword,
      name: 'Admin User',
      role: 'ADMIN'
    }
  })
  console.log('Created admin:', admin.email)

  // Create agent user
  const agentPassword = await bcrypt.hash('agent123', 10)
  const agent = await prisma.user.upsert({
    where: { email: 'agent@smartseason.com' },
    update: {},
    create: {
      email: 'agent@smartseason.com',
      password: agentPassword,
      name: 'John Agent',
      role: 'AGENT'
    }
  })
  console.log('Created agent:', agent.email)

  // Create sample fields
  const fieldsData = [
    {
      name: 'North Field',
      cropType: 'Wheat',
      plantingDate: new Date('2026-03-15'),
      stage: 'GROWING' as const,
      agentId: agent.id
    },
    {
      name: 'South Field',
      cropType: 'Corn',
      plantingDate: new Date('2026-04-01'),
      stage: 'PLANTED' as const,
      agentId: agent.id
    },
    {
      name: 'East Field',
      cropType: 'Rice',
      plantingDate: new Date('2026-02-20'),
      stage: 'GROWING' as const,
      agentId: agent.id
    },
    {
      name: 'West Field',
      cropType: 'Soybeans',
      plantingDate: new Date('2026-03-01'),
      stage: 'READY' as const,
      agentId: null
    },
    {
      name: 'Garden A',
      cropType: 'Vegetables',
      plantingDate: new Date('2026-04-10'),
      stage: 'PLANTED' as const,
      agentId: agent.id
    },
    {
      name: 'Orchard B',
      cropType: 'Apples',
      plantingDate: new Date('2025-11-15'),
      stage: 'GROWING' as const,
      agentId: null
    }
  ]

  for (const fieldData of fieldsData) {
    const field = await prisma.field.create({
      data: fieldData
    })
    console.log('Created field:', field.name)
  }

  // Create some field updates
  const fields = await prisma.field.findMany()
  
  if (fields.length > 0) {
    await prisma.fieldUpdate.create({
      data: {
        fieldId: fields[0].id,
        userId: agent.id,
        stage: 'Growing',
        notes: 'Crop is growing well, no issues detected.'
      }
    })
    console.log('Created field update for:', fields[0].name)
  }

  console.log('Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })