"use server";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { pusher } from "@/lib/pusher";
import { TaskPriority, TaskStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

// PROJECT ACTIONS -----------------------------------------------------------------------------------
export const getProjects = async () => {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const projects = await prisma.project.findMany({
    where: {
      // OR: [
      //   { createdById: user.id },
      //   {
      //     members: {
      //       some: {
      //         userId: user.id,
      //       },
      //     },
      //   },
      // ],
    },
    select: {
      id: true,
      name: true,
      description: true,
      createdAt: true,
      members: {
        select: { id: true, name: true, image: true, email: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return projects;
};

export const getProject = async (projectId: string) => {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      // OR: [
      //   // { createdById: user.id },
      //   {
      //     members: {
      //       some: {
      //         userId: user.id,
      //         // role: { in: ["OWNER", "ADMIN"] },
      //       },
      //     },
      //   },
      // ],
    },
    select: {
      id: true,
      name: true,
      description: true,
      createdAt: true,
      members: {
        select: { id: true, name: true, image: true, email: true },
      },
      tasks: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          description: true,
          status: true,
          priority: true,
          createdAt: true,
          assignedTo: {
            select: { id: true, name: true, email: true, image: true },
          },
        },
      },
    },
  });

  return project;
};

export const createProject = async ({ name }: { name: string }) => {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  try {
    const project = await prisma.project.create({
      data: {
        name,
        createdById: user.id,
      },
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
        members: {
          select: { id: true, name: true, image: true, email: true },
        },
      },
    });

    // Emit real-time event via Pusher
    await pusher.trigger("projects", "project:created", project);

    revalidatePath("/dashboard/projects");
    return { success: true, project };
  } catch (error) {
    return {
      message: "Failed to create project",
      error: error instanceof Error ? error.message : String(error),
    };
  }
};

export const updateProject = async (
  id: string,
  name: string,
  description: string,
) => {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  try {
    const project = await prisma.project.update({
      where: {
        id,
        // createdById: user.id
      },
      data: {
        name,
        description,
      },
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
        members: {
          select: { id: true, name: true, image: true, email: true },
        },
      },
    });

    // Emit real-time event via Pusher
    await pusher.trigger("projects", "project:updated", project);

    revalidatePath("/dashboard/projects");
    return { success: true, project };
  } catch (error) {
    return {
      message: "Failed to update project",
      error: error instanceof Error ? error.message : String(error),
    };
  }
};

export const deleteProject = async (id: string) => {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  try {
    const project = await prisma.project.delete({
      where: {
        id,
        // createdById: user.id,
      },
    });

    // Emit real-time event via pusher
    await pusher.trigger("projects", "project:deleted", project.id);

    revalidatePath("/dashboard/projects");
    return { success: true };
  } catch (error) {
    return {
      message: "Failed to delete project",
      error: error instanceof Error ? error.message : String(error),
    };
  }
};

// TASK ACTIONS-----------------------------------------------------------------------------------------------------------------

export const getTasks = async (projectId: string) => {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const tasks = await prisma.task.findMany({
    where: {
      projectId,
      // OR: [
      //   { assignedToId: user.id },
      //   {
      //     project: {
      //       OR: [
      //         { createdById: user.id },
      //         {
      //           members: {
      //             some: {
      //               id: user.id,
      //             },
      //           },
      //         },
      //       ],
      //     },
      //   },
      // ],
    },
    select: {
      id: true,
      title: true,
      description: true,
      status: true,
      priority: true,
      createdAt: true,
      assignedTo: {
        select: { id: true, name: true, email: true, image: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return tasks;
};

export const getTask = async (id: string) => {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const task = await prisma.task.findFirst({
    where: {
      id,
      // OR: [
      //   { assignedToId: user.id },
      //   {
      //     project: {
      //       OR: [
      //         { createdById: user.id },
      //         {
      //           members: {
      //             some: {
      //               id: user.id,
      //             },
      //           },
      //         },
      //       ],
      //     },
      //   },
      // ],
    },
    select: {
      id: true,
      title: true,
      description: true,
      projectId: true,
      status: true,
      priority: true,
      createdAt: true,
      assignedTo: {
        select: { id: true, name: true, email: true, image: true },
      },
    },
  });

  return task;
};

export const createTask = async ({
  title,
  description,
  projectId,
  status = "TODO",
  priority = "MEDIUM",
}: {
  title: string;
  projectId: string;
  description?: string;
  status?: string;
  priority?: string;
}) => {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  try {
    const task = await prisma.task.create({
      data: {
        title,
        projectId,
        description,
        status: status as TaskStatus,
        priority: priority as TaskPriority,
      },
    });
    // Emit real-time event via pusher
    await pusher.trigger(`project-${task.projectId}`, "task:created", task);

    revalidatePath(`/dashboard/projects/${task.projectId}`);
    return { success: true, task };
  } catch (error) {
    return {
      message: "Failed to create task",
      error: error instanceof Error ? error.message : String(error),
    };
  }
};

export const updateTask = async (
  id: string,
  {
    title,
    description,
    status,
    priority,
  }: {
    title: string;
    description?: string;
    status?: string;
    priority?: string;
  },
) => {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  try {
    const task = await prisma.task.update({
      where: {
        id,
        // OR: [
        //   { assignedToId: user.id },
        //   {
        //     project: {
        //       OR: [
        //         { createdById: user.id },
        //         {
        //           members: {
        //             some: {
        //               id: user.id,
        //             },
        //           },
        //         },
        //       ],
        //     },
        //   },
        // ],
      },
      data: {
        title,
        description,
        status: status as TaskStatus,
        priority: priority as TaskPriority,
      },
      select: {
        id: true,
        title: true,
        description: true,
        projectId: true,
        status: true,
        priority: true,
        createdAt: true,
        assignedTo: {
          select: { id: true, name: true, email: true, image: true },
        },
      },
    });

    // Emit real-time event via pusher
    await pusher.trigger(`project-${task.projectId}`, "task:updated", task);

    revalidatePath(`/dashboard/projects/${task.projectId}`);
    return { success: true, task };
  } catch (error) {
    return {
      message: "Failed to update task",
      error: error instanceof Error ? error.message : String(error),
    };
  }
};

export const deleteTask = async (id: string) => {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  try {
    const task = await prisma.task.delete({
      where: {
        id,
        // OR: [
        //   { assignedToId: user.id },
        //   {
        //     project: {
        //       OR: [
        //         { createdById: user.id },
        //         {
        //           members: {
        //             some: {
        //               id: user.id,
        //             },
        //           },
        //         },
        //       ],
        //     },
        //   },
        // ],
      },
      select: {
        id: true,
        projectId: true,
      },
    });

    // Emit real-time event via pusher
    await pusher.trigger(`project-${task.projectId}`, "task:deleted", task.id);

    revalidatePath(`/dashboard/projects/${task.projectId}`);
    return { success: true };
  } catch (error) {
    return {
      message: "Failed to delete task",
      error: error instanceof Error ? error.message : String(error),
    };
  }
};

export const assignTask = async (taskId: string, assigneeId: string) => {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  try {
    const task = await prisma.task.update({
      where: {
        id: taskId,
        project: {
          OR: [
            { createdById: user.id },
            {
              members: {
                some: {
                  id: user.id,
                },
              },
            },
          ],
        },
      },
      data: {
        assignedToId: assigneeId,
      },
    });

    // Emit real-time event via pusher
    await pusher.trigger(`project-${task.projectId}`, "task:assigned", task);

    revalidatePath(`/dashboard/projects/${task.projectId}`);
    return { success: true, task };
  } catch (error) {
    return {
      message: "Failed to assign task",
      error: error instanceof Error ? error.message : String(error),
    };
  }
};

export const changeTaskStatus = async (
  taskId: string,
  status: "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE",
) => {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  try {
    const task = await prisma.task.update({
      where: {
        id: taskId,
        OR: [
          { assignedToId: user.id },
          {
            project: {
              OR: [
                { createdById: user.id },
                {
                  members: {
                    some: {
                      id: user.id,
                    },
                  },
                },
              ],
            },
          },
        ],
      },
      data: { status },
    });

    // Emit real-time event via pusher
    pusher.trigger(`project-${task.projectId}`, "task:status-changed", task);

    revalidatePath(`/dashboard/projects/${task.projectId}`);
    return { success: true, task };
  } catch (error) {
    return {
      message: "Failed to change task status",
      error: error instanceof Error ? error.message : String(error),
    };
  }
};
