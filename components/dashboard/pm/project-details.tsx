"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  deleteProject,
  getProject,
  getTask,
  updateProject,
} from "@/lib/actions/projects";
import { TypeProject } from "@/types";
import { useParams, useRouter } from "next/navigation";
import Pusher from "pusher-js";
import React, { useEffect, useState } from "react";
import Tasks from "./tasks";
import toast from "react-hot-toast";

type Project = Awaited<ReturnType<typeof getProject>>;
type Task = Awaited<ReturnType<typeof getTask>>;

interface ProjectDetailsProps {
  initialProject: Project;
  initialTasks: Task[];
}

const ProjectDetails = ({
  initialProject,
  initialTasks,
}: ProjectDetailsProps) => {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [project, setProject] = useState<TypeProject | null>(initialProject);
  const [isEditing, setIsEditing] = useState(false);
  const [projectName, setProjectName] = useState(initialProject?.name || "");
  const [projectDescription, setProjectDescription] = useState(
    initialProject?.description || "",
  );

  useEffect(() => {
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });

    if (params.id) {
      const channel = pusher.subscribe("projects");

      channel.bind("project:updated", (updatedProject: TypeProject) => {
        setProject(updatedProject);
      });

      channel.bind("project:deleted", (deletedProjectId: string) => {
        if (deletedProjectId === project?.id) {
          toast.success("This project has been deleted.");
          router.push("/dashboard/projects");
        }
      });

      return () => {
        pusher.unsubscribe("projects");
      };
    }
  }, [params.id, project?.id, router]);

  const handleUpdateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName) {
      return;
    }
    if (project) {
      await updateProject(project.id, projectName, projectDescription);
      setIsEditing(false);
      toast.success("Project updated");
    }
  };

  const handleDeleteProject = async () => {
    if (
      project &&
      window.confirm("Are you sure you want to delete this project?")
    ) {
      await deleteProject(params.id);
      router.push("/dashboard/projects");
    }
  };

  if (!project) return <div>Loading...</div>;

  return (
    <div className="pb-10">
      {isEditing ? (
        <form onSubmit={handleUpdateProject} className="mb-4">
          <Input
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            className="mb-2"
          />
          <Textarea
            value={projectDescription}
            onChange={(e) => setProjectDescription(e.target.value)}
            className="mb-2"
          />
          <Button type="submit">Save</Button>
          <Button
            type="button"
            onClick={() => setIsEditing(false)}
            variant={"outline"}
          >
            Cancel
          </Button>
        </form>
      ) : (
        <div className="mb-4">
          <h2 className="text-2xl font-bold">{project.name}</h2>
          <p className="text-gray-600">{project.description}</p>
          <Button
            onClick={() => setIsEditing(true)}
            className="mt-2"
            variant={"outline"}
          >
            Edit
          </Button>
          <Button
            onClick={handleDeleteProject}
            className="ml-2"
            variant={"destructive"}
          >
            Delete
          </Button>
        </div>
      )}
      <Tasks projectId={project.id} initialTasks={initialTasks} />
    </div>
  );
};

export default ProjectDetails;
