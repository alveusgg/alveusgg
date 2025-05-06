import { DateTime } from "luxon";

import { prisma } from "@alveusgg/database";

import type { ScheduledTasksConfig } from "@/data/scheduled-tasks";
import { scheduledTasks } from "@/data/scheduled-tasks";

type TaskConfig = ScheduledTasksConfig["tasks"][number];

const MAX_EXECUTION_DURATION = 1000 * 60 * 5; // 5 minutes

async function executeTask(
  taskConfig: TaskConfig,
  nextExecutionTime: DateTime,
) {
  const startTime = new Date();
  const event = await prisma.taskExecutionEvent.create({
    select: { id: true },
    data: {
      startedAt: startTime,
      task: taskConfig.id,
    },
  });

  try {
    await taskConfig.task(nextExecutionTime.toJSDate());
  } catch (exception) {
    console.error(`Error executing task ${taskConfig.id}`, exception);
  }

  const finishTime = new Date();
  await prisma.taskExecutionEvent.update({
    where: { id: event.id },
    data: {
      finishedAt: finishTime,
    },
  });
}

async function checkTaskIsDue(taskConfig: TaskConfig) {
  const lastExecutionEvent = await prisma.taskExecutionEvent.findFirst({
    select: { startedAt: true, finishedAt: true },
    where: { task: taskConfig.id },
    orderBy: { startedAt: "desc" },
  });

  let lastExecutionTime = taskConfig.startDateTime;
  if (lastExecutionEvent) {
    // Check if the task is still running
    if (lastExecutionEvent.finishedAt === null) {
      const duration = DateTime.now().diff(
        DateTime.fromJSDate(lastExecutionEvent.startedAt),
      );
      // Do not run again if it is still running and not stuck
      if (duration.toMillis() <= MAX_EXECUTION_DURATION) {
        return false;
      }

      // When the task is stuck, use the last successful execution time
      const lastSuccessfulExecutionEvent =
        await prisma.taskExecutionEvent.findFirst({
          select: { startedAt: true },
          where: { task: taskConfig.id, finishedAt: { not: null } },
          orderBy: { startedAt: "desc" },
        });
      if (lastSuccessfulExecutionEvent) {
        lastExecutionTime = lastSuccessfulExecutionEvent.startedAt;
      }
    } else {
      // Last execution has finished, use the last execution time
      lastExecutionTime = lastExecutionEvent.startedAt;
    }
  }

  const nextExecutionTime = DateTime.fromJSDate(lastExecutionTime).plus(
    taskConfig.interval,
  );
  if (nextExecutionTime >= DateTime.now()) return false;
  return nextExecutionTime;
}

export async function runScheduledTasks() {
  await Promise.allSettled(
    scheduledTasks.tasks.map(async (taskConfig: TaskConfig) => {
      const nextExecutionTime = await checkTaskIsDue(taskConfig);
      if (nextExecutionTime !== false)
        await executeTask(taskConfig, nextExecutionTime);
    }),
  );
}
