import { TaskStatus } from "@/types";

const initialTasks = [
  {
    id: "1",
    title: "Task 1",
    status: TaskStatus.TODO,
    projectId: "1",
    createdAt: new Date(),
  },
  {
    id: "2",
    title: "Task 2",
    status: TaskStatus.IN_PROGRESS,
    projectId: "1",
    createdAt: new Date(),
  },
  {
    id: "3",
    title: "Task 3",
    status: TaskStatus.REVIEW,
    projectId: "1",
    createdAt: new Date(),
  },
  {
    id: "4",
    title: "Task 4",
    status: TaskStatus.DONE,
    projectId: "1",
    createdAt: new Date(),
  },
  {
    id: "5",
    title: "Task 5",
    status: TaskStatus.IN_PROGRESS,
    projectId: "1",
    createdAt: new Date(),
  },
  {
    id: "6",
    title: "Task 6",
    status: TaskStatus.REVIEW,
    projectId: "1",
    createdAt: new Date(),
  },
  {
    id: "7",
    title: "Task 7",
    status: TaskStatus.DONE,
    projectId: "1",
    createdAt: new Date(),
  },
];

const Dashboard = async () => {
  return (
    <div className="mx-auto max-w-7xl p-4">
      <h1 className="mb-4 text-2xl font-bold">Dashboard</h1>
      {/* <div className="mt-8">
        <Tasks initialTasks={initialTasks} projectId="1" />
      </div> */}
    </div>
  );
};

export default Dashboard;
