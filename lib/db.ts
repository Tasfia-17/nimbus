import { PrismaClient } from '@prisma/client';

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
// Learn more: https://pris.ly/d/help/next-js-best-practices

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Helper functions for common database operations

export async function getAgentWithExecutions(agentId: string, limit: number = 10) {
  return prisma.agent.findUnique({
    where: { id: agentId },
    include: {
      executions: {
        orderBy: { startedAt: 'desc' },
        take: limit,
      },
    },
  });
}

export async function getActiveAgents() {
  return prisma.agent.findMany({
    where: { status: 'ACTIVE' },
    orderBy: { updatedAt: 'desc' },
  });
}

export async function getRecentExecutions(limit: number = 20) {
  return prisma.execution.findMany({
    include: {
      agent: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: { startedAt: 'desc' },
    take: limit,
  });
}

export async function getDashboardStats() {
  const totalAgents = await prisma.agent.count({
    where: { status: { not: 'DELETED' } },
  });

  const activeAgents = await prisma.agent.count({
    where: { status: 'ACTIVE' },
  });

  const totalExecutions = await prisma.execution.count();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const executionsToday = await prisma.execution.count({
    where: {
      startedAt: {
        gte: today,
      },
    },
  });

  const successfulExecutions = await prisma.execution.count({
    where: { status: 'SUCCESS' },
  });

  const successRate = totalExecutions > 0 
    ? (successfulExecutions / totalExecutions) * 100 
    : 0;

  // Calculate total cost
  const costResult = await prisma.execution.aggregate({
    _sum: {
      cost: true,
    },
  });

  // Estimate hours saved (assuming each execution saves 30 minutes on average)
  const hoursSaved = (successfulExecutions * 0.5);

  return {
    totalAgents,
    activeAgents,
    totalExecutions,
    executionsToday,
    successRate: Math.round(successRate * 10) / 10,
    hoursSaved: Math.round(hoursSaved),
    totalCost: Number(costResult._sum.cost || 0),
  };
}

export async function updateExecutionStatus(
  executionId: string,
  status: 'RUNNING' | 'SUCCESS' | 'FAILED' | 'CANCELLED',
  additionalData?: {
    completedAt?: Date;
    duration?: number;
    result?: any;
    error?: string;
    cost?: number;
  }
) {
  return prisma.execution.update({
    where: { id: executionId },
    data: {
      status,
      ...additionalData,
    },
  });
}

export async function addExecutionLog(
  executionId: string,
  log: {
    level: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' | 'DEBUG';
    message: string;
    metadata?: any;
    stepId?: string;
  }
) {
  const execution = await prisma.execution.findUnique({
    where: { id: executionId },
    select: { logs: true },
  });

  const logs = Array.isArray(execution?.logs) ? execution.logs : [];
  
  const newLog = {
    timestamp: new Date().toISOString(),
    level: log.level,
    message: log.message,
    metadata: log.metadata,
    stepId: log.stepId,
  };

  return prisma.execution.update({
    where: { id: executionId },
    data: {
      logs: [...logs, newLog],
    },
  });
}

export default prisma;
