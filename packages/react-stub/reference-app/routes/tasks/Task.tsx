import { LoaderFunction, useLoaderData } from "react-router-dom";

import { getTasks } from "~/tasks";
import { sleep } from "~/utils";

export const loader: LoaderFunction = async ({ params }) => {
  await sleep();
  return {
    task: getTasks().find((t) => t.id === params.id),
  };
};

export default function Task() {
  const data = useLoaderData() as ReturnType<typeof loader>;

  return (
    <>
      <h3>Task</h3>
      <p>{data.task.task}</p>
    </>
  );
}
