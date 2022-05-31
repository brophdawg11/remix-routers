import { Link, useFetcher } from "react-router-dom";

import type { Task } from "../tasks";

export interface TaskItemProps {
  task: Task;
}

export default function TaskItem({ task }: TaskItemProps) {
  let fetcher = useFetcher();
  let isDeleting = fetcher.formData != null;

  return (
    <>
      <span>{task.task}</span> <Link to={`/tasks/${task.id}`}>Open</Link>{" "}
      <fetcher.Form style={{ display: "inline" }} action="/tasks" method="post">
        <button
          type="submit"
          name="taskId"
          value={task.id}
          disabled={isDeleting}
        >
          {isDeleting ? "Deleting..." : "❌"}
        </button>
      </fetcher.Form>
    </>
  );
}
