import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import authRouter from './routes/auth'
import fieldsRouter from './routes/fields'
import usersRouter from './routes/users'
import { authenticateToken } from './middleware/auth'
import prisma from './lib/prisma'

/**
 * SmartSeason Backend Entry Point
 * 
 * Purpose:
 * This is the central hub of our server. It initializes the Express application, 
 * connects to the PostgreSQL database, and coordinates all incoming API requests.
 * 
 * How it works:
 * 1. Loads configuration from .env variables.
 * 2. Sets up security middleware (CORS) and data parsing (JSON).
 * 3. Registers modular route handlers (Auth, Fields, Users).
 * 4. Provides a "catch-all" handler to support React Router in production.
 * 5. Starts the HTTP server on the configured port.
 */


// Load environment variables from .env early so they're available everywhere.
// This is where we keep our sensitive database URLs and JWT secrets.
dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

/*
 * Middleware Setup
 * ----------------
 * 1. CORS: Allows our frontend (e.g., on Vercel) to talk to this API safely.
 * 2. express.json(): Essential for parsing JSON bodies in POST/PUT requests.
 */
app.use(cors())
app.use(express.json())

/*
 * API Routes
 * ----------
 * We split our routes into logical chunks (Auth, Fields, Users) to keep 
 * the codebase manageable. Notice that some routes are protected by 
 * the 'authenticateToken' middleware.
 */
app.use('/api/auth', authRouter)
app.use('/api/fields', authenticateToken, fieldsRouter)
app.use('/api/users', authenticateToken, usersRouter)

/*
 * Static File Serving & SPA Support
 * ---------------------------------
 * In a Single Page Application (SPA), the frontend handles the routing.
 * However, if a user hits 'Refresh' on a page like /fields/5, the browser 
 * sends a request to THIS server for that path. 
 * 
 * To prevent a 404 error, we do two things:
 * 1. Serve any physical files (images, JS, CSS) from the 'dist' folder.
 * 2. For any other request, send back index.html and let React Router take over.
 */
const clientDistPath = path.join(process.cwd(), '../client/dist')
app.use(express.static(clientDistPath))

// Health check endpoint - used by monitoring tools to ensure the service is alive.
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

/*
 * The "Catch-all" Route
 * This is the magic fix for the "404 on refresh" problem. If the request 
 * doesn't match an API or a static file, we assume it's a frontend route.
 */
app.get('*', (req, res) => {
  res.sendFile(path.join(clientDistPath, 'index.html'), (err) => {
    if (err) {
      // If index.html isn't found, the frontend probably hasn't been built yet.
      res.status(200).send('SmartSeason API is running. (Note: Frontend build was not detected at ' + clientDistPath + ')')
    }
  })
})

/*
 * Global Error Handler
 * A safety net that catches any unhandled errors in our routes so the 
 * server doesn't crash. It logs the mess and sends a polite 500 response.
 */
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('SERVER ERROR:', err.stack)
  res.status(500).json({ message: 'Something went wrong on our end!' })
})

/*
 * Server Startup
 * We connect to the database first to ensure everything is ready before 
 * we start taking traffic. This is super helpful for debugging deployment logs.
 */
app.listen(PORT, async () => {
  console.log(`🚀 SmartSeason Server running on port ${PORT}`)
  try {
    await prisma.$connect()
    console.log('✅ Database connected successfully')
  } catch (error) {
    console.error('❌ Database connection failed:', error)
  }
})

export default app