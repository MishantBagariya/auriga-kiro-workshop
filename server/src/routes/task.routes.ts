import { Router } from 'express'
import { taskController } from '../controllers/task.controller.js'
import { validate, validateQuery } from '../middleware/validate.js'
import { createTaskSchema, updateTaskSchema, updateTaskStatusSchema, taskQuerySchema } from 'shared'

const router = Router()

router.get('/', validateQuery(taskQuerySchema), taskController.getAll)
router.get('/:id', taskController.getById)
router.post('/', validate(createTaskSchema), taskController.create)
router.put('/:id', validate(updateTaskSchema), taskController.update)
router.patch('/:id/status', validate(updateTaskStatusSchema), taskController.updateStatus)
router.delete('/:id', taskController.delete)

export { router as taskRoutes }
