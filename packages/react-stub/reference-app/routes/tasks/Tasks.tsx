import type { ActionFunction, LoaderFunction } from "react-router-dom";
import { Link, Outlet, useLoaderData } from "react-router-dom";

import { deleteTask, getTasks, Task } from "~/tasks";
import { sleep } from "~/utils";
import TaskItem from "~/components/TaskItem";

export const loader: LoaderFunction = async () => {
  await sleep();
  return {
    tasks: getTasks(),
  };
};

export const action: ActionFunction = async ({ request }) => {
  await sleep();
  let formData = await request.formData();
  deleteTask(formData.get("taskId") as string);
  return {};
};

export default function Tasks() {
  const data = useLoaderData() as ReturnType<typeof loader>;

  return (
    <>
      <h2>Tasks</h2>
      <ul>
        {data.tasks.map((task: Task) => (
          <li key={task.id}>
            <TaskItem task={task} />
          </li>
        ))}
      </ul>
      <Link to="/tasks/new">Add New Task</Link>
      <Outlet />
    </>
  );
}
