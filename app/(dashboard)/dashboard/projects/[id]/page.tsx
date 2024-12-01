import ProjectDetails from "@/components/dashboard/pm/project-details";
import { getProject, getTask } from "@/lib/actions/projects";

type Task = Awaited<ReturnType<typeof getTask>>;

const ProjectPage = async ({ params }: { params: { id: string } }) => {
  const project = await getProject(params.id);

  return (
    <ProjectDetails
      initialProject={project!}
      initialTasks={project?.tasks as Task[]}
    />
  );
};

export default ProjectPage;
