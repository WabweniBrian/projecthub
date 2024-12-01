import Projects from "@/components/dashboard/pm/projects";
import { getProjects } from "@/lib/actions/projects";

const ProjectsPage = async () => {
  const projects = await getProjects();
  return (
    <div>
      <Projects initialProjects={projects} />
    </div>
  );
};

export default ProjectsPage;
