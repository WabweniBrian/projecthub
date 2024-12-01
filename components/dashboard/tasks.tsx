"use client";

import { formatWord } from "@/lib/utils";
import { Task, TaskStatus } from "@/types";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import Image from "next/image";
import { useState } from "react";
import { ImAttachment } from "react-icons/im";
import { IoChatboxEllipsesOutline } from "react-icons/io5";
import { Separator } from "../ui/separator";

interface TasksProps {
  initialTasks: Task[];
  projectId: string;
}

const statusColors: Record<TaskStatus, string> = {
  TODO: "bg-blue-500",
  IN_PROGRESS: "bg-yellow-500",
  REVIEW: "bg-purple-500",
  DONE: "bg-green-500",
};

const statusTextColors: Record<TaskStatus, string> = {
  TODO: "text-blue-600",
  IN_PROGRESS: "text-yellow-600",
  REVIEW: "text-purple-600",
  DONE: "text-green-600",
};

const statusBgColors: Record<TaskStatus, string> = {
  TODO: "bg-blue-600/20",
  IN_PROGRESS: "bg-yellow-600/20",
  REVIEW: "bg-purple-600/20",
  DONE: "bg-green-600/20",
};

const Tasks = ({ initialTasks, projectId }: TasksProps) => {
  const [tasks, setTasks] = useState(initialTasks);
  const [activeColumn, setActiveColumn] = useState<string | null>(null);

  const onDragEnd = async (result: any) => {
    const { source, destination } = result;

    setActiveColumn(null);

    if (!destination) return;

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    const sourceStatus = source.droppableId
      .split("-")[0]
      .toUpperCase() as TaskStatus;

    const destinationStatus = destination.droppableId
      .split("-")[0]
      .toUpperCase() as TaskStatus;

    const updatedTasks = [...tasks];

    if (sourceStatus === destinationStatus) {
      const columnTasks = updatedTasks.filter(
        (task) => task.status === sourceStatus,
      );
      const [movedTask] = columnTasks.splice(source.index, 1);
      columnTasks.splice(destination.index, 0, movedTask);

      const otherTasks = updatedTasks.filter(
        (task) => task.status !== sourceStatus,
      );
      updatedTasks.length = 0;
      updatedTasks.push(...otherTasks, ...columnTasks);
    } else {
      const sourceTasks = updatedTasks.filter(
        (task) => task.status === sourceStatus,
      );
      const destinationTasks = updatedTasks.filter(
        (task) => task.status === destinationStatus,
      );

      const [movedTask] = sourceTasks.splice(source.index, 1);
      movedTask.status = destinationStatus;
      destinationTasks.splice(destination.index, 0, movedTask);

      const otherTasks = updatedTasks.filter(
        (task) =>
          task.status !== sourceStatus && task.status !== destinationStatus,
      );
      updatedTasks.length = 0;
      updatedTasks.push(...otherTasks, ...sourceTasks, ...destinationTasks);
    }

    setTasks(updatedTasks);

    // TODO: Update database
  };

  const onDragUpdate = (update: any) => {
    setActiveColumn(update.destination?.droppableId || null);
  };

  return (
    <DragDropContext onDragEnd={onDragEnd} onDragUpdate={onDragUpdate}>
      <div className="grid grid-cols-4 gap-4">
        {["TODO", "IN_PROGRESS", "REVIEW", "DONE"].map((status) => {
          const tasksForStatus = tasks.filter((task) => task.status === status);
          return (
            <Droppable
              key={status}
              droppableId={`${status.toLowerCase()}-column`}
            >
              {(provided, snapshot) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className={`rounded-xl p-4 transition-all ${
                    snapshot.isDraggingOver
                      ? "border-2 border-dotted border-blue-500 bg-blue-50"
                      : "bg-gray-200"
                  }`}
                >
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center">
                      <span
                        className={`mr-2 h-3 w-3 rounded-full ${
                          statusColors[status as TaskStatus]
                        }`}
                      ></span>
                      <h2 className="text-lg font-bold uppercase">
                        {formatWord(status)}
                      </h2>
                    </div>
                    <div
                      className={`h-6 w-6 shrink-0 rounded-full text-xs font-medium flex-center-center ${
                        statusBgColors[status as TaskStatus]
                      } ${statusTextColors[status as TaskStatus]}`}
                    >
                      {tasksForStatus.length}
                    </div>
                  </div>
                  {tasksForStatus.map((task, index) => (
                    <Draggable
                      key={task.id}
                      draggableId={task.id}
                      index={index}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="mb-4 rounded-xl bg-white shadow"
                        >
                          <div className="p-4">
                            <div className="mb-2 flex items-center justify-between">
                              <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-semibold text-yellow-500">
                                Medium
                              </span>
                              <span className="text-xs text-gray-500">
                                Jan, 24
                              </span>
                            </div>
                            <h3 className="text-base font-bold">
                              {task.title}
                            </h3>
                            <p className="mt-1 text-sm text-gray-600">
                              Identify the weak and strong points of competitor
                              features and analyze what we can implement on the
                              website.
                            </p>
                          </div>
                          <Separator className="my-3" />
                          <div className="flex items-center justify-between px-4 pb-4">
                            {/* Avatars */}
                            <div className="flex-align-center">
                              <Image
                                src="/default-image.jpg"
                                alt="Avatar"
                                width={30}
                                height={30}
                                className="h-8 w-8 rounded-full border-2 border-background object-cover"
                              />
                              <Image
                                src="/default-image.jpg"
                                alt="Avatar"
                                width={30}
                                height={30}
                                className="-ml-4 h-8 w-8 rounded-full border-2 border-background object-cover"
                              />
                            </div>
                            <div className="gap-x-2 flex-align-center">
                              <div className="gap-x-1 flex-align-center">
                                <ImAttachment className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">
                                  1
                                </span>
                              </div>
                              <div className="gap-x-1 flex-align-center">
                                <IoChatboxEllipsesOutline className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">
                                  14
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {tasksForStatus.length === 0 && !snapshot.isDraggingOver && (
                    <div className="w-full flex-center-center">
                      <div className="mt-10">
                        <div className="relative mx-auto h-20 w-20 dark:opacity-60">
                          <Image
                            src={"/no-results.png"}
                            alt="No results"
                            fill
                            className="object-contain"
                          />
                        </div>
                        <h1 className="text-xl font-semibold text-muted-foreground">
                          No Tasks
                        </h1>
                      </div>
                    </div>
                  )}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          );
        })}
      </div>
    </DragDropContext>
  );
};

export default Tasks;
