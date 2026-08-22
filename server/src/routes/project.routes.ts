import { Router } from 'express'
import { projectController } from '../controllers/project.controller.js'
import { validate } from '../middleware/validate.js'
import { createProjectSchema, updateProjectSchema } from 'shared'

const router = Router()

router.get('/', projectController.getAll)
router.get('/:id', projectController.getById)
router.post('/', validate(createProjectSchema), projectController.create)
router.put('/:id', validate(updateProjectSchema), projectController.update)
router.delete('/:id', projectController.delete)

export { router as projectRoutes }
