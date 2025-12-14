import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

const agentSchema = z.object({
  name: z.string().min(1, "Agent name is required"),
  description: z.string().optional(),
  instructions: z.string().min(1, "Instructions are required"),
  model: z.string().default("gpt-4"),
  triggers: z.array(z.any()).default([]), // More detailed schema for triggers later
  tools: z.array(z.any()).default([]), // More detailed schema for tools later
});

export async function GET() {
  try {
    const agents = await prisma.agent.findMany();
    return NextResponse.json({ agents });
  } catch (error: unknown) {
    console.error("Error fetching agents:", error);
    return NextResponse.json(
      { message: "Failed to fetch agents" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = agentSchema.parse(body);

    // Placeholder for Kestra workflow creation
    // const kestraWorkflowId = await createKestraWorkflow(validatedData);
    const kestraWorkflowId = ""; // Temporary placeholder

    const agent = await prisma.agent.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        instructions: validatedData.instructions,
        model: validatedData.model,
        triggers: validatedData.triggers,
        tools: validatedData.tools,
        kestraWorkflowId: kestraWorkflowId,
      },
    });

    return NextResponse.json({ agent }, { status: 201 });
  } catch (error: unknown) {
    console.error("Error creating agent:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation failed", errors: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { message: "Failed to create agent" },
      { status: 500 }
    );
  }
}
