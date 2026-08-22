import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { projectRoutes } from './routes/project.routes.js'
import { taskRoutes } from './routes/task.routes.js'
import { dashboardRoutes } from './routes/dashboard.routes.js'
import { errorHandler } from './middleware/error-handler.js'

const app = express()

// Middleware
app.use(helmet())
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }))
app.use(express.json())

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Routes
app.use('/api/projects', projectRoutes)
app.use('/api/tasks', taskRoutes)
app.use('/api/dashboard', dashboardRoutes)

// Error handling (must be last)
app.use(errorHandler)

export { app }
