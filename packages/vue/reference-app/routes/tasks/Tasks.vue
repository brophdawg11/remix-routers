<script lang="ts">
import { ActionFunction, LoaderFunction } from "@remix-run/router";
import { Outlet, useLoaderData } from "remix-router-vue";

import { deleteTask, getTasks } from "~/tasks";
import { sleep } from "~/utils";
import TaskItem from "~/components/TaskItem.vue";

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
</script>

<script setup lang="ts">
const data = useLoaderData();
</script>

<template>
  <h2>Tasks</h2>
  <ul>
    <li v-for="task in data.tasks" :key="task.id">
      <TaskItem :task="task" />
    </li>
  </ul>
  <Outlet />
</template>
