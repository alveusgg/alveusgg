import { DateTime } from "luxon";

import type { ScheduledTasksConfig } from "@/data/scheduled-tasks";
import { getScheduledTasksConfig } from "@/data/scheduled-tasks";
import { prisma } from "@/server/db/client";

type TaskConfig = ScheduledTasksConfig["tasks"][number];

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
  await taskConfig.task(nextExecutionTime.toJSDate());
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
    if (lastExecutionEvent.finishedAt === null) {
      // still running, do not run again
      return false;
    }
    lastExecutionTime = lastExecutionEvent.startedAt;
  }

  const nextExecutionTime = DateTime.fromJSDate(lastExecutionTime).plus(
    taskConfig.interval,
  );
  if (nextExecutionTime >= DateTime.now()) return false;
  return nextExecutionTime;
}

export async function runScheduledTasks() {
  const config = await getScheduledTasksConfig();

  await Promise.allSettled(
    config.tasks.map(async (taskConfig: TaskConfig) => {
      const nextExecutionTime = await checkTaskIsDue(taskConfig);
      if (nextExecutionTime !== false)
        await executeTask(taskConfig, nextExecutionTime);
    }),
  );
}
