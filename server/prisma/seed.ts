import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Clean existing data
  await prisma.task.deleteMany()
  await prisma.project.deleteMany()

  // Create projects
  const websiteRedesign = await prisma.project.create({
    data: {
      name: 'Website Redesign',
      description: 'Redesign the company website with a modern look and improved UX.',
      status: 'ACTIVE',
    },
  })

  const mobileApp = await prisma.project.create({
    data: {
      name: 'Mobile App Development',
      description: 'Build a cross-platform mobile application for task management.',
      status: 'ACTIVE',
    },
  })

  const marketingCampaign = await prisma.project.create({
    data: {
      name: 'Q1 Marketing Campaign',
      description: 'Plan and execute the marketing campaign for Q1.',
      status: 'COMPLETED',
    },
  })

  // Create tasks for Website Redesign
  await prisma.task.createMany({
    data: [
      {
        title: 'Design homepage mockup',
        description: 'Create wireframes and high-fidelity mockups for the new homepage.',
        projectId: websiteRedesign.id,
        status: 'COMPLETED',
        priority: 'HIGH',
        labels: ['design', 'homepage'],
      },
      {
        title: 'Implement responsive navigation',
        description: 'Build the responsive navigation component with mobile hamburger menu.',
        projectId: websiteRedesign.id,
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        labels: ['frontend', 'navigation'],
      },
      {
        title: 'Set up CI/CD pipeline',
        description: 'Configure automated deployment pipeline for the website.',
        projectId: websiteRedesign.id,
        status: 'TODO',
        priority: 'MEDIUM',
        labels: ['devops'],
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      },
      {
        title: 'Write unit tests for components',
        description: 'Add test coverage for all new React components.',
        projectId: websiteRedesign.id,
        status: 'TODO',
        priority: 'MEDIUM',
        labels: ['testing'],
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
      },
      {
        title: 'Optimize images and assets',
        description: 'Compress images and optimize asset loading for performance.',
        projectId: websiteRedesign.id,
        status: 'TODO',
        priority: 'LOW',
        labels: ['performance'],
      },
    ],
  })

  // Create tasks for Mobile App
  await prisma.task.createMany({
    data: [
      {
        title: 'Set up React Native project',
        description: 'Initialize the React Native project with TypeScript configuration.',
        projectId: mobileApp.id,
        status: 'COMPLETED',
        priority: 'HIGH',
        labels: ['setup'],
      },
      {
        title: 'Design app navigation flow',
        description: 'Define the navigation structure and implement stack/tab navigation.',
        projectId: mobileApp.id,
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        labels: ['design', 'navigation'],
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      },
      {
        title: 'Implement authentication screens',
        description: 'Build login and registration screens with form validation.',
        projectId: mobileApp.id,
        status: 'TODO',
        priority: 'HIGH',
        labels: ['auth', 'frontend'],
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
      },
      {
        title: 'Create task list component',
        description: 'Build a reusable task list component with infinite scrolling.',
        projectId: mobileApp.id,
        status: 'TODO',
        priority: 'MEDIUM',
        labels: ['frontend', 'components'],
      },
    ],
  })

  // Create tasks for Marketing Campaign
  await prisma.task.createMany({
    data: [
      {
        title: 'Define target audience',
        description: 'Research and document the target audience personas.',
        projectId: marketingCampaign.id,
        status: 'COMPLETED',
        priority: 'HIGH',
        labels: ['research'],
      },
      {
        title: 'Create social media content calendar',
        description: 'Plan 3 months of social media posts across all platforms.',
        projectId: marketingCampaign.id,
        status: 'COMPLETED',
        priority: 'MEDIUM',
        labels: ['content', 'social-media'],
      },
      {
        title: 'Launch email campaign',
        description: 'Set up and send the email campaign to subscriber list.',
        projectId: marketingCampaign.id,
        status: 'COMPLETED',
        priority: 'HIGH',
        labels: ['email', 'launch'],
      },
    ],
  })

  console.log('Seed data created successfully!')
  console.log(`  - 3 projects`)
  console.log(`  - 12 tasks`)
}

main()
  .catch((e) => {
    console.error('Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
