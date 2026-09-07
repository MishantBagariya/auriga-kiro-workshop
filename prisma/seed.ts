import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";
import { PrismaClient } from "../lib/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const db = new PrismaClient({ adapter });

async function main() {
  // Clear existing data
  await db.task.deleteMany();
  await db.project.deleteMany();

  // --- Projects ---
  const websiteRedesign = await db.project.create({
    data: {
      name: "Website Redesign",
      description: "Revamp the company marketing website with modern design and better UX.",
      status: "active",
    },
  });

  const mobileApp = await db.project.create({
    data: {
      name: "Mobile App v2",
      description: "Build the second version of the mobile app with offline support and push notifications.",
      status: "active",
    },
  });

  const apiMigration = await db.project.create({
    data: {
      name: "API Migration",
      description: "Migrate legacy REST APIs to GraphQL endpoints.",
      status: "completed",
    },
  });

  const designSystem = await db.project.create({
    data: {
      name: "Design System",
      description: "Create a shared component library and design tokens for all products.",
      status: "active",
    },
  });

  const devOps = await db.project.create({
    data: {
      name: "DevOps Pipeline",
      description: "Set up CI/CD pipelines, monitoring, and alerting infrastructure.",
      status: "archived",
    },
  });

  // --- Tasks for Website Redesign ---
  await db.task.createMany({
    data: [
      {
        title: "Design homepage mockup",
        description: "Create high-fidelity mockup for the new homepage layout.",
        projectId: websiteRedesign.id,
        status: "completed",
        priority: "high",
        dueDate: new Date("2026-08-20"),
        labels: JSON.stringify(["design", "homepage"]),
      },
      {
        title: "Implement responsive navigation",
        description: "Build the responsive navbar with mobile hamburger menu.",
        projectId: websiteRedesign.id,
        status: "in_progress",
        priority: "high",
        dueDate: new Date("2026-08-30"),
        labels: JSON.stringify(["frontend", "navigation"]),
      },
      {
        title: "Set up analytics tracking",
        description: "Integrate Google Analytics and event tracking for key user actions.",
        projectId: websiteRedesign.id,
        status: "todo",
        priority: "medium",
        dueDate: new Date("2026-09-05"),
        labels: JSON.stringify(["analytics"]),
      },
      {
        title: "Write SEO-optimized content",
        description: "Rewrite landing page copy with SEO best practices.",
        projectId: websiteRedesign.id,
        status: "todo",
        priority: "medium",
        dueDate: new Date("2026-09-10"),
        labels: JSON.stringify(["content", "seo"]),
      },
      {
        title: "Performance audit",
        description: "Run Lighthouse and WebPageTest audits, fix any issues below 90 score.",
        projectId: websiteRedesign.id,
        status: "todo",
        priority: "low",
        dueDate: new Date("2026-09-15"),
        labels: JSON.stringify(["performance"]),
      },
    ],
  });

  // --- Tasks for Mobile App v2 ---
  await db.task.createMany({
    data: [
      {
        title: "Implement offline data sync",
        description: "Add local storage queue that syncs when connectivity is restored.",
        projectId: mobileApp.id,
        status: "in_progress",
        priority: "high",
        dueDate: new Date("2026-09-01"),
        labels: JSON.stringify(["offline", "sync"]),
      },
      {
        title: "Push notification service",
        description: "Integrate Firebase Cloud Messaging for push notifications.",
        projectId: mobileApp.id,
        status: "todo",
        priority: "high",
        dueDate: new Date("2026-09-08"),
        labels: JSON.stringify(["notifications", "firebase"]),
      },
      {
        title: "Redesign settings screen",
        description: "Update the settings UI to match the new design system.",
        projectId: mobileApp.id,
        status: "todo",
        priority: "medium",
        dueDate: new Date("2026-09-12"),
        labels: JSON.stringify(["design", "ui"]),
      },
      {
        title: "Add biometric authentication",
        description: "Support fingerprint and face ID for app unlock.",
        projectId: mobileApp.id,
        status: "todo",
        priority: "medium",
        labels: JSON.stringify(["security", "auth"]),
      },
      {
        title: "Write unit tests for sync module",
        projectId: mobileApp.id,
        status: "todo",
        priority: "low",
        dueDate: new Date("2026-09-20"),
        labels: JSON.stringify(["testing"]),
      },
      {
        title: "Beta release preparation",
        description: "Prepare TestFlight and Play Store beta builds.",
        projectId: mobileApp.id,
        status: "todo",
        priority: "high",
        dueDate: new Date("2026-09-25"),
        labels: JSON.stringify(["release"]),
      },
    ],
  });

  // --- Tasks for API Migration (completed project) ---
  await db.task.createMany({
    data: [
      {
        title: "Define GraphQL schema",
        projectId: apiMigration.id,
        status: "completed",
        priority: "high",
        labels: JSON.stringify(["graphql", "schema"]),
      },
      {
        title: "Migrate user endpoints",
        projectId: apiMigration.id,
        status: "completed",
        priority: "high",
        labels: JSON.stringify(["migration", "users"]),
      },
      {
        title: "Migrate product endpoints",
        projectId: apiMigration.id,
        status: "completed",
        priority: "medium",
        labels: JSON.stringify(["migration", "products"]),
      },
      {
        title: "Update API documentation",
        projectId: apiMigration.id,
        status: "completed",
        priority: "low",
        labels: JSON.stringify(["docs"]),
      },
    ],
  });

  // --- Tasks for Design System ---
  await db.task.createMany({
    data: [
      {
        title: "Define color tokens",
        description: "Establish primary, secondary, and neutral color palettes with dark mode variants.",
        projectId: designSystem.id,
        status: "completed",
        priority: "high",
        labels: JSON.stringify(["tokens", "color"]),
      },
      {
        title: "Build Button component",
        description: "Create Button with variants: primary, secondary, outline, ghost, destructive.",
        projectId: designSystem.id,
        status: "completed",
        priority: "high",
        labels: JSON.stringify(["component"]),
      },
      {
        title: "Build Input components",
        description: "Text input, textarea, select, and checkbox components.",
        projectId: designSystem.id,
        status: "in_progress",
        priority: "medium",
        dueDate: new Date("2026-08-29"),
        labels: JSON.stringify(["component", "forms"]),
      },
      {
        title: "Write Storybook documentation",
        description: "Add stories for all components with usage examples.",
        projectId: designSystem.id,
        status: "todo",
        priority: "low",
        dueDate: new Date("2026-09-15"),
        labels: JSON.stringify(["docs", "storybook"]),
      },
    ],
  });

  // --- Tasks for DevOps Pipeline (archived) ---
  await db.task.createMany({
    data: [
      {
        title: "Set up GitHub Actions CI",
        projectId: devOps.id,
        status: "completed",
        priority: "high",
        labels: JSON.stringify(["ci", "github"]),
      },
      {
        title: "Configure Docker builds",
        projectId: devOps.id,
        status: "completed",
        priority: "medium",
        labels: JSON.stringify(["docker"]),
      },
      {
        title: "Set up Datadog monitoring",
        projectId: devOps.id,
        status: "completed",
        priority: "medium",
        labels: JSON.stringify(["monitoring"]),
      },
    ],
  });

  const taskCount = await db.task.count();
  const projectCount = await db.project.count();
  console.log(`✅ Seeded ${projectCount} projects and ${taskCount} tasks`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
