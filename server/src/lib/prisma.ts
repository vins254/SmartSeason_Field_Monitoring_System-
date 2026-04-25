/**
 * Database Connection Layer (Prisma)
 * 
 * This file initializes and exports a single instance of the Prisma Client.
 * By using a singleton pattern here, we ensure that the application maintains 
 * a stable connection pool to the database without creating redundant connections.
 * 
 * Usage: Import 'prisma' from this file anywhere you need to perform DB queries.
 */

import { PrismaClient } from '@prisma/client'

// Instantiate the client
const prisma = new PrismaClient()

export default prisma