import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRouter from './routes/auth'
import fieldsRouter from './routes/fields'
import usersRouter from './routes/users'
import { authenticateToken } from './middleware/auth'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(cors())
app.use(express.json())

// Public routes
app.use('/api/auth', authRouter)

// Protected routes
app.use('/api/fields', authenticateToken, fieldsRouter)
app.use('/api/users', authenticateToken, usersRouter)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack)
  res.status(500).json({ message: 'Something went wrong!' })
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

export default app