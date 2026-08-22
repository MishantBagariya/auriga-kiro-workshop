import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.task.deleteMany();
  await prisma.project.deleteMany();

  const websiteRedesign = await prisma.project.create({
    data: {
      name: "Website Redesign",
      description: "Refresh the marketing site's design and content.",
      status: "Active",
    },
  });

  const mobileApp = await prisma.project.create({
    data: {
      name: "Mobile App Launch",
      description: "Ship v1 of the mobile app to the app stores.",
      status: "Active",
    },
  });

  const internalTools = await prisma.project.create({
    data: {
      name: "Internal Tools Cleanup",
      description: "Archive unused internal tooling and scripts.",
      status: "Archived",
    },
  });

  const inThreeDays = new Date();
  inThreeDays.setDate(inThreeDays.getDate() + 3);
  const inTenDays = new Date();
  inTenDays.setDate(inTenDays.getDate() + 10);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  await prisma.task.createMany({
    data: [
      {
        title: "Design new homepage hero section",
        description: "Explore 3 directions for the hero and get stakeholder sign-off.",
        projectId: websiteRedesign.id,
        status: "InProgress",
        priority: "High",
        dueDate: inThreeDays,
        labels: JSON.stringify(["design"]),
      },
      {
        title: "Write copy for pricing page",
        projectId: websiteRedesign.id,
        status: "ToDo",
        priority: "Medium",
        dueDate: inTenDays,
        labels: JSON.stringify(["content"]),
      },
      {
        title: "Fix broken footer links",
        projectId: websiteRedesign.id,
        status: "Completed",
        priority: "Low",
        dueDate: yesterday,
      },
      {
        title: "Set up App Store listing",
        projectId: mobileApp.id,
        status: "ToDo",
        priority: "High",
        dueDate: inTenDays,
        labels: JSON.stringify(["release"]),
      },
      {
        title: "Fix push notification bug on iOS",
        projectId: mobileApp.id,
        status: "InProgress",
        priority: "High",
      },
      {
        title: "Write onboarding flow copy",
        projectId: mobileApp.id,
        status: "ToDo",
        priority: "Medium",
      },
      {
        title: "Archive deprecated deploy scripts",
        projectId: internalTools.id,
        status: "Completed",
        priority: "Low",
      },
    ],
  });

  console.log("Seed complete.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
