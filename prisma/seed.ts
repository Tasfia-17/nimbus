import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database with example tools...");

  // Clear existing tools first (optional - comment out if you want to keep existing data)
  await prisma.tool.deleteMany({});

  const githubApiTool = await prisma.tool.create({
    data: {
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

  const sendEmailTool = await prisma.tool.create({
    data: {
      name: "Send Email",
      description: "Sends an email to specified recipients.",
      type: "FUNCTION",
      config: {
        function: "sendEmail", // Placeholder for a function to be implemented later
      },
    },
  });

  const webScraperTool = await prisma.tool.create({
    data: {
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
