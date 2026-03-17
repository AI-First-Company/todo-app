import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.todo.createMany({
    data: [
      {
        title: "Set up the project",
        completed: true,
        priority: "high",
        category: "Work",
      },
      {
        title: "Buy groceries",
        completed: false,
        priority: "medium",
        category: "Shopping",
        dueDate: "2026-03-18",
      },
      {
        title: "Go for a run",
        completed: false,
        priority: "low",
        category: "Health",
      },
    ],
  });
  console.log("Seeded database with sample todos.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
