"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import {
  changeTaskStatus,
  createTask,
  deleteTask,
  getTask,
} from "@/lib/actions/projects";
import { cn, formatWord } from "@/lib/utils";
import { TaskStatus } from "@/types";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import { format } from "date-fns";
import { CheckCircle, Edit, MoreHorizontal, Plus, Trash } from "lucide-react";
import Image from "next/image";
import Pusher from "pusher-js";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { ImAttachment } from "react-icons/im";
import { IoChatboxEllipsesOutline } from "react-icons/io5";
import { EditTaskDialog } from "./update-task";

type Task = Awaited<ReturnType<typeof getTask>>;

interface TasksProps {
  projectId: string;
  initialTasks: Task[];
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

const Tasks = ({ projectId, initialTasks }: TasksProps) => {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [newTaskTitles, setNewTaskTitles] = useState<
    Record<TaskStatus, string>
  >({
    TODO: "",
    IN_PROGRESS: "",
    REVIEW: "",
    DONE: "",
  });

  const [editModal, setEditModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  useEffect(() => {
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });

    const channel = pusher.subscribe(`project-${projectId}`);
    channel.bind("task:created", (newTask: Task) => {
      setTasks((prevTasks) => [...prevTasks, newTask]);
    });
    channel.bind("task:updated", (updatedTask: Task) => {
      setTasks((prevTasks) =>
        prevTasks?.map((task) =>
          task?.id === updatedTask?.id ? updatedTask : task,
        ),
      );
    });
    channel.bind("task:deleted", (taskId: string) => {
      setTasks((prevTasks) => prevTasks?.filter((task) => task?.id !== taskId));
    });
    channel.bind("task:status-changed", (changedTask: Task) => {
      setTasks((prevTasks) =>
        prevTasks?.map((task) =>
          task?.id === changedTask?.id ? changedTask : task,
        ),
      );
    });

    return () => {
      pusher.unsubscribe(`project-${projectId}`);
    };
  }, [projectId]);

  const handleCreateTask = async (status: TaskStatus) => {
    await createTask({ title: newTaskTitles[status], projectId, status });
    setNewTaskTitles((prev) => ({ ...prev, [status]: "" }));
    toast.success("Task created successfully!");
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    await deleteTask(taskId);
    toast.success("Task deleted successfully!");
  };

  const handleEditTask = async (taskId: string) => {
    const task = await getTask(taskId);
    setEditingTask(task);
    setEditModal(true);
  };

  const onDragEnd = async (result: any) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    const newStatus = destination.droppableId
      .split("-")[0]
      .toUpperCase() as TaskStatus;
    await changeTaskStatus(draggableId, newStatus);
    toast.success("Task status changed!");
  };

  return (
    <div>
      <h2 className="mb-4 text-2xl font-bold">Tasks</h2>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-4 overflow-x-auto py-4">
          {(["TODO", "IN_PROGRESS", "REVIEW", "DONE"] as TaskStatus[]).map(
            (status) => {
              const tasksForStatus = tasks.filter(
                (task) => task?.status === status,
              );
              return (
                <Droppable
                  key={status}
                  droppableId={`${status.toLowerCase()}-column`}
                >
                  {(provided, snapshot) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className={`w-[300px] shrink-0 rounded-xl p-4 transition-all ${
                        snapshot.isDraggingOver
                          ? "border-2 border-dotted border-blue-500 bg-blue-50"
                          : "bg-gray-200"
                      }`}
                    >
                      <div className="mb-4 flex items-center justify-between">
                        <div className="flex items-center">
                          <span
                            className={`mr-2 h-3 w-3 rounded-full ${statusColors[status]}`}
                          ></span>
                          <h3 className="text-lg font-bold uppercase">
                            {formatWord(status)}
                          </h3>
                          <div
                            className={`ml-2 h-6 w-6 shrink-0 rounded-full text-xs font-medium flex-center-center ${
                              statusBgColors[status as TaskStatus]
                            } ${statusTextColors[status as TaskStatus]}`}
                          >
                            {tasksForStatus.length}
                          </div>
                        </div>

                        <div className="gap-x-1 flex-align-center">
                          {/* Add Task */}

                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                className="h-8 w-8"
                                size={"icon"}
                                variant={"outline"}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent>
                              <form
                                onSubmit={(e) => {
                                  e.preventDefault();
                                  handleCreateTask(status);
                                }}
                                className="flex-align-center"
                              >
                                <Input
                                  type="text"
                                  value={newTaskTitles[status]}
                                  onChange={(e) =>
                                    setNewTaskTitles((prev) => ({
                                      ...prev,
                                      [status]: e.target.value,
                                    }))
                                  }
                                  placeholder="New task title"
                                  className="mr-2 flex-1"
                                />
                                <Button type="submit" size="icon">
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </form>
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>
                      {tasksForStatus.map((task, index) => (
                        <Draggable
                          key={task?.id}
                          draggableId={task?.id!}
                          index={index}
                        >
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="mb-4 rounded-xl bg-white p-4 shadow"
                            >
                              <div>
                                <div className="flex-center-between">
                                  <h3 className="flex-1 truncate text-base font-bold">
                                    {task?.title}
                                  </h3>
                                  {/* Actions Dropdown */}
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button
                                        className="h-8 w-8"
                                        size={"icon"}
                                        variant={"ghost"}
                                      >
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                      <DropdownMenuItem
                                        asChild
                                        onClick={() =>
                                          handleEditTask(task?.id!)
                                        }
                                      >
                                        <div className="cursor-pointer flex-align-center">
                                          <div className="mr-1">
                                            <Edit className="h-4 w-4" />
                                          </div>
                                          <span>Edit</span>
                                        </div>
                                      </DropdownMenuItem>
                                      <DropdownMenuItem asChild>
                                        <div className="cursor-pointer flex-align-center">
                                          <div className="mr-1">
                                            <CheckCircle className="h-4 w-4" />
                                          </div>
                                          <span>Assign Member(s)</span>
                                        </div>
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        asChild
                                        onClick={() =>
                                          handleDeleteTask(task?.id!)
                                        }
                                      >
                                        <div className="cursor-pointer flex-align-center">
                                          <div className="mr-1">
                                            <Trash className="h-4 w-4 !text-red-500" />
                                          </div>
                                          <span className="!text-red-500">
                                            Delete
                                          </span>
                                        </div>
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                                <div className="mb-2 mt-4 flex items-center justify-between">
                                  <span
                                    className={cn(
                                      "rounded-full px-2 py-1 text-xs font-semibold",
                                      {
                                        "bg-yellow-600/20 text-yellow-600":
                                          task?.priority === "HIGH",
                                        "bg-blue-600/20 text-blue-600":
                                          task?.priority === "MEDIUM",
                                        "bg-green-600/20 text-green-600":
                                          task?.priority === "LOW",
                                        "bg-red-600/20 text-red-600":
                                          task?.priority === "URGENT",
                                      },
                                    )}
                                  >
                                    {task?.priority}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {format(
                                      new Date(task?.createdAt!),
                                      "dd, MMM",
                                    )}
                                  </span>
                                </div>
                                <p className="mt-1 text-sm text-gray-600">
                                  {task?.description}
                                </p>
                              </div>
                              <Separator className="my-3" />
                              <div className="flex items-center justify-between px-4 pb-4">
                                {/* Assignes */}
                                {task?.assignedTo ? (
                                  <HoverCard>
                                    <HoverCardTrigger>
                                      <Image
                                        src={
                                          task?.assignedTo?.image
                                            ? task?.assignedTo?.image
                                            : "/default-image.jpg"
                                        }
                                        alt={task.assignedTo.name}
                                        width={30}
                                        height={30}
                                        className="h-8 w-8 rounded-full border-2 border-background object-cover"
                                      />
                                    </HoverCardTrigger>
                                    <HoverCardContent>
                                      <div className="flex-align-center">
                                        <Image
                                          src={
                                            task?.assignedTo?.image
                                              ? task?.assignedTo?.image
                                              : "/default-image.jpg"
                                          }
                                          alt={task.assignedTo.name}
                                          width={80}
                                          height={80}
                                          className="h-16 w-16 shrink-0 rounded-full border-2 border-background object-cover"
                                        />
                                        <div>
                                          <h1 className="text-lg">
                                            {task?.assignedTo?.name}
                                          </h1>
                                          <p className="text-sm">
                                            {task?.assignedTo?.email}
                                          </p>
                                        </div>
                                      </div>
                                    </HoverCardContent>
                                  </HoverCard>
                                ) : (
                                  <p className="text-sm">No Assignees</p>
                                )}

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
                      {tasksForStatus.length === 0 &&
                        !snapshot.isDraggingOver && (
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
            },
          )}
        </div>
      </DragDropContext>

      {/* Task Edit Modal */}

      {editModal && (
        <EditTaskDialog
          task={editingTask}
          editModal={editModal}
          setEditModal={setEditModal}
        />
      )}
    </div>
  );
};

export default Tasks;
