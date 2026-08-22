import { prisma } from '../lib/prisma.js'
import type { CreateTaskInput, UpdateTaskInput, TaskQueryInput } from 'shared'
import { Prisma } from '@prisma/client'

export const taskService = {
  async findAll(query: TaskQueryInput) {
    const { search, projectId, status, priority, sortBy = 'createdAt', sortOrder = 'desc' } = query

    const where: Prisma.TaskWhereInput = {}

    if (search) {
      where.title = { contains: search, mode: 'insensitive' }
    }
    if (projectId) {
      where.projectId = projectId
    }
    if (status) {
      where.status = status
    }
    if (priority) {
      where.priority = priority
    }

    // Handle priority sorting by mapping to numeric values
    let orderBy: Prisma.TaskOrderByWithRelationInput = {}
    if (sortBy === 'priority') {
      // Prisma doesn't natively sort enums by custom order,
      // so we sort by priority field directly (alphabetical)
      orderBy = { priority: sortOrder }
    } else {
      orderBy = { [sortBy]: sortOrder }
    }

    return prisma.task.findMany({
      where,
      orderBy,
      include: {
        project: { select: { id: true, name: true } },
      },
    })
  },

  async findById(id: string) {
    return prisma.task.findUnique({
      where: { id },
      include: {
        project: { select: { id: true, name: true } },
      },
    })
  },

  async create(data: CreateTaskInput) {
    // Verify the project exists
    const project = await prisma.project.findUnique({
      where: { id: data.projectId },
    })

    if (!project) {
      throw Object.assign(new Error('Project not found'), { statusCode: 400 })
    }

    return prisma.task.create({
      data: {
        title: data.title,
        description: data.description || '',
        projectId: data.projectId,
        status: data.status || 'TODO',
        priority: data.priority || 'MEDIUM',
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        labels: data.labels || [],
      },
      include: {
        project: { select: { id: true, name: true } },
      },
    })
  },

  async update(id: string, data: UpdateTaskInput) {
    // If projectId is being changed, verify the new project exists
    if (data.projectId) {
      const project = await prisma.project.findUnique({
        where: { id: data.projectId },
      })
      if (!project) {
        throw Object.assign(new Error('Project not found'), { statusCode: 400 })
      }
    }

    const updateData: Prisma.TaskUpdateInput = { ...data }
    if (data.dueDate !== undefined) {
      updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null
    }

    return prisma.task.update({
      where: { id },
      data: updateData,
      include: {
        project: { select: { id: true, name: true } },
      },
    })
  },

  async updateStatus(id: string, status: string) {
    return prisma.task.update({
      where: { id },
      data: { status: status as 'TODO' | 'IN_PROGRESS' | 'COMPLETED' },
      include: {
        project: { select: { id: true, name: true } },
      },
    })
  },

  async delete(id: string) {
    return prisma.task.delete({ where: { id } })
  },
}
