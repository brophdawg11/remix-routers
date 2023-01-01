import type { ActionFunction, LoaderFunction } from "remix-router-solid";
import { Link, Outlet, useLoaderData } from "remix-router-solid";

import { deleteTask, getTasks, Task } from "~/tasks";
import { sleep } from "~/utils";
import { TaskItem } from "~/components/TaskItem";
import { For } from "solid-js";

type LoaderData = {
  tasks: Task[];
};

export const tasksLoader: LoaderFunction = async () => {
  await sleep();
  return {
    tasks: getTasks(),
  };
};

export const tasksAction: ActionFunction = async ({ request }) => {
  await sleep();
  let formData = await request.formData();
  deleteTask(formData.get("taskId") as string);
  return {};
};

export const Tasks = () => {
  const data = useLoaderData<LoaderData>();

  return (
    <>
      <h2>Tasks</h2>
      <ul>
        <For each={data().tasks}>
        {(task) => (
        <li>
            <TaskItem task={task} />
        </li>
        )}
        </For>
      </ul>
      <Link to="/tasks/new">Add New Task</Link>
      <Outlet />
    </>
  );
}
