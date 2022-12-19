import add from "date-fns/add";
import isPast from "date-fns/isPast";

import type { ScheduledTasksConfig } from "../../config/scheduledTasks";
import { getScheduledTasksConfig } from "../../config/scheduledTasks";

import { prisma } from "../db/client";

type TaskConfig = ScheduledTasksConfig["tasks"][number];

async function executeTask(taskConfig: TaskConfig) {
  const startTime = new Date();
  await taskConfig.task();
  const finishTime = new Date();
  await prisma.taskExecutionEvent.create({
    data: {
      startedAt: startTime,
      finishedAt: finishTime,
      task: taskConfig.id,
    },
  });
}

async function checkTaskIsDue(taskConfig: TaskConfig) {
  const lastExecutionTime =
    (
      await prisma.taskExecutionEvent.findFirst({
        select: { startedAt: true },
        where: { task: taskConfig.id },
        orderBy: { startedAt: "desc" },
      })
    )?.startedAt || taskConfig.startDateTime;
  const nextExecutionTime = add(lastExecutionTime, taskConfig.interval);
  return isPast(nextExecutionTime);
}

export async function runScheduledTasks() {
  const config = await getScheduledTasksConfig();

  await Promise.allSettled(
    config.tasks.map(async (taskConfig: TaskConfig) => {
      if (await checkTaskIsDue(taskConfig)) {
        await executeTask(taskConfig);
      }
    })
  );
}
