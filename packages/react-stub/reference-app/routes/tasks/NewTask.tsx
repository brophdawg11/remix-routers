import {
  ActionFunction,
  redirect,
  Form,
  useNavigation,
} from "react-router-dom";

import { addTask } from "~/tasks";
import { sleep } from "~/utils";

export const action: ActionFunction = async ({ request }) => {
  await sleep();
  let formData = await request.formData();
  addTask(formData.get("newTask") as string);
  return redirect("/tasks", { status: 302 });
};

export default function NewTask() {
  const navigation = useNavigation();
  const isAdding = navigation.state !== "idle";

  return (
    <>
      <h3>New Task</h3>
      <Form method="post" action="/tasks/new">
        <input name="newTask" />
        <button type="submit" disabled={isAdding}>
          {isAdding ? "Adding..." : "Add"}
        </button>
      </Form>
    </>
  );
}
