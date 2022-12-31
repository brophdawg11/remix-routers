import { useLoaderData, json } from "remix-router-solid";
import type { LoaderFunction } from "remix-router-solid";

import { sleep } from "~/utils";
import { getTasks,  Task as TaskType } from "~/tasks";

type LoaderData = {
  task: TaskType;
};

export const taskLoader: LoaderFunction = async ({ params }) => {
  await sleep();
  return json({
    task: getTasks().find((t) => t.id === params.id),
  });
};

export const Task = () => {
  const data = useLoaderData<LoaderData>();

  return (
    <>
      <h3>Task</h3>
      <p>{data().task.task}</p>
    </>
  );
}
