import { prisma } from '../lib/prisma.js'
import type { CreateProjectInput, UpdateProjectInput } from 'shared'

export const projectService = {
  async findAll() {
    return prisma.project.findMany({
      include: {
        _count: {
          select: { tasks: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
  },

  async findById(id: string) {
    return prisma.project.findUnique({
      where: { id },
      include: {
        tasks: {
          orderBy: { createdAt: 'desc' },
          include: {
            project: { select: { id: true, name: true } },
          },
        },
        _count: {
          select: { tasks: true },
        },
      },
    })
  },

  async create(data: CreateProjectInput) {
    return prisma.project.create({ data })
  },

  async update(id: string, data: UpdateProjectInput) {
    return prisma.project.update({
      where: { id },
      data,
    })
  },

  async delete(id: string) {
    return prisma.project.delete({ where: { id } })
  },
}
