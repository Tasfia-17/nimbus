import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database with example tools...");

  const githubApiTool = await prisma.tool.upsert({
    where: { name: "GitHub API" },
    update: {},
    create: {
      name: "GitHub API",
      description: "Provides access to various GitHub API functionalities.",
      type: "API",
      config: {
        url: "https://api.github.com",
        headers: {
          Authorization: "Bearer {{GITHUB_TOKEN}}",
          "Content-Type": "application/json",
        },
      },
    },
  });

  const sendEmailTool = await prisma.tool.upsert({
    where: { name: "Send Email" },
    update: {},
    create: {
      name: "Send Email",
      description: "Sends an email to specified recipients.",
      type: "FUNCTION",
      config: {
        function: "sendEmail", // Placeholder for a function to be implemented later
      },
    },
  });

  const webScraperTool = await prisma.tool.upsert({
    where: { name: "Web Scraper" },
    update: {},
    create: {
      name: "Web Scraper",
      description: "Scrapes content from a given URL.",
      type: "FUNCTION",
      config: {
        function: "scrapeWebpage", // Placeholder for a function to be implemented later
      },
    },
  });

  console.log({ githubApiTool, sendEmailTool, webScraperTool });
  console.log("Seeding complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
