"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createProject, deleteProject } from "@/lib/actions/projects";
import { TypeProject } from "@/types";
import { Plus, X } from "lucide-react";
import Link from "next/link";
import Pusher from "pusher-js";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface ProjectsProps {
  initialProjects: TypeProject[];
}

const Projects = ({ initialProjects }: ProjectsProps) => {
  const [projects, setProjects] = useState<TypeProject[]>(initialProjects);
  const [newProjectName, setNewProjectName] = useState("");

  useEffect(() => {
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });

    const channel = pusher.subscribe("projects");
    channel.bind("project:created", (newProject: TypeProject) => {
      setProjects((prevProjects) => [...prevProjects, newProject]);
    });

    channel.bind("project:deleted", (deletedProjectId: string) => {
      setProjects((prevProjects) =>
        prevProjects.filter((project) => project.id !== deletedProjectId),
      );
    });

    channel.bind("project:updated", (updatedProject: TypeProject) => {
      setProjects((prevProjects) =>
        prevProjects?.map((project) =>
          project?.id === updatedProject?.id ? updatedProject : project,
        ),
      );
    });

    return () => {
      pusher.unsubscribe("projects");
    };
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    try {
      await createProject({ name: newProjectName });
      setNewProjectName("");
      toast.success("Project added");
    } catch (error) {
      console.error("Failed to create project:", error);
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      await deleteProject(id);
      toast.success("Project deleted");
    }
  };

  return (
    <div>
      <h2 className="mb-4 text-2xl font-bold">Projects</h2>
      <form onSubmit={handleCreateProject} className="mb-4 flex">
        <Input
          type="text"
          value={newProjectName}
          onChange={(e) => setNewProjectName(e.target.value)}
          placeholder="New project name"
          className="mr-2 flex-1"
        />
        <Button type="submit">
          <Plus className="h-5 w-5" />
        </Button>
      </form>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <div key={project.id} className="relative h-full">
            <Link href={`/dashboard/projects/${project.id}`} className="block">
              <div className="rounded-lg bg-white p-4 shadow hover:shadow-md">
                <h3 className="text-lg font-semibold">{project?.name}</h3>
                <p className="text-gray-600">
                  {project?.description ?? "No Description"}
                </p>
              </div>
            </Link>
            <div
              onClick={() => handleDeleteProject(project.id)}
              className="absolute -right-1 -top-1 z-10 h-8 w-8 cursor-pointer rounded-full bg-red-500 text-white transition-a flex-center-center hover:bg-red-600"
            >
              <X className="h-4 w-4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Projects;
