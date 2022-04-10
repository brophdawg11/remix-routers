<script lang="ts">
import { ActionFunctionArgs } from "@remix-run/router";
import { defineComponent, effect } from "vue";

import {
  Form,
  Link,
  Outlet,
  useLoaderData,
  useNavigation,
} from "../remix-router-vue";
import { deleteTask, getTasks } from "../tasks";

export async function loader() {
  await new Promise((r) => setTimeout(r, 1000));
  return {
    tasks: getTasks(),
  };
}

export async function action({ formData }: ActionFunctionArgs) {
  await new Promise((r) => setTimeout(r, 1000));
  deleteTask(formData.get("taskId") as string);
  return {};
}

export default defineComponent({
  name: "Tasks",
  components: {
    Form,
    Link,
    Outlet,
  },
  setup() {
    let data = useLoaderData();
    let transition = useNavigation();
    let isDeleting = (id: string) => {
      console.log("checkig deletion for id", id, transition.value);
      return transition.value?.formData?.get("taskId") === id;
    };

    effect(() => console.log(transition.value));

    return {
      data,
      isDeleting,
    };
  },
});
</script>

<template>
  <h3>Tasks</h3>
  <p>
    Tasks listing - using a client side
    <code>loader</code> / <code>useLoaderData</code>
  </p>
  <ul>
    <li v-for="task in data.tasks" :key="task.id">
      {{ task.task }}
      <Link :to="`/tasks/${task.id}`">Open</Link>
      &nbsp;
      <Form style="display: inline" action="/tasks" method="post">
        <button
          type="submit"
          name="taskId"
          :value="task.id"
          :disabled="isDeleting(task.id)"
        >
          {{ isDeleting(task.id) ? "Deleting..." : "❌" }}
        </button>
      </Form>
    </li>
  </ul>
  <Outlet />
</template>
