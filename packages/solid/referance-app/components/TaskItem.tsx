import { Link, useFetcher } from "remix-router-solid";

import type { Task } from "../tasks";

export interface TaskItemProps {
  task: Task;
}

export const TaskItem = ({ task }: TaskItemProps)  => {
  console.log("Calling TaskItem");
  let fetcher = useFetcher();
  let isDeleting = () => {
      debugger;
      console.log("Recalculating isDeleting");
      return fetcher().formData != null
    };
 const Form = fetcher().Form

  return (
    <>
      <span>{task.task}</span> <Link to={`/tasks/${task.id}`}>Open</Link>{" "}
      <Form style={{ display: "inline" }} action="/tasks" method="post">
        <button
          type="submit"
          name="taskId"
          value={task.id}
          disabled={isDeleting()}
        >
          {isDeleting() ? "Deleting..." : "❌"}
        </button>
      </Form>
    </>
  );
}

