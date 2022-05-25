<script lang="ts">
import { ActionFunction, LoaderFunction } from "@remix-run/router";
import { defineComponent } from "vue";

import { Form, Link, Outlet, useLoaderData } from "remix-router-vue";
import { deleteTask, getTasks } from "../tasks";
import TaskItem from "./TaskItem.vue";

export const loader: LoaderFunction = async () => {
  await new Promise((r) => setTimeout(r, 1000));
  return {
    tasks: getTasks(),
  };
};

export const action: ActionFunction = async ({ request }) => {
  let formData = await request.formData();
  await new Promise((r) => setTimeout(r, 1000));
  deleteTask(formData.get("taskId") as string);
  return {};
};

export default defineComponent({
  name: "Tasks",
  components: {
    Form,
    Link,
    Outlet,
    TaskItem,
  },
  setup() {
    let data = useLoaderData();

    return {
      data,
    };
  },
});
</script>

<template>
  <h3>Tasks</h3>
  <ul>
    <li v-for="task in data.tasks" :key="task.id">
      <TaskItem :task="task" />
    </li>
  </ul>
  <Outlet />
</template>
