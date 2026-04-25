import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRouter from './routes/auth'
import fieldsRouter from './routes/fields'
import usersRouter from './routes/users'
import { authenticateToken } from './middleware/auth'
import prisma from './lib/prisma'

// Load environment variables from .env early so they're available everywhere
dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

/*
 * Middleware Setup
 * We're using CORS to allow our frontend (on Vercel) to talk to this API.
 * express.json() is essential so we can parse the body of incoming POST requests.
 */
app.use(cors())
app.use(express.json())

/*
 * Routes Definition
 * We split our routes into logical chunks to keep this file clean.
 * Notice that some routes are public (auth), while others need a valid token.
 */
app.use('/api/auth', authRouter)
app.use('/api/fields', authenticateToken, fieldsRouter)
app.use('/api/users', authenticateToken, usersRouter)

// A simple root route just to confirm the server is alive when you visit the URL
app.get('/', (req, res) => {
  res.send('SmartSeason API is running. Direct UI access is not available here.')
})

// Used by health monitors to check if the service is up and responsive
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

/*
 * Global Error Handler
 * This catches any unhandled errors in our routes so the server doesn't just crash.
 * It's a safety net that logs the stack trace and sends a 500 response.
 */
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack)
  res.status(500).json({ message: 'Something went wrong!' })
})

/*
 * Server Startup
 * Before we start listening for traffic, we try to connect to the database.
 * This is super helpful during deployment because it tells us immediately if our
 * DATABASE_URL or credentials are wrong in the Render logs.
 */
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`)
  try {
    await prisma.$connect()
    console.log('Database connected successfully')
  } catch (error) {
    console.error('Database connection failed:', error)
  }
})

export default app