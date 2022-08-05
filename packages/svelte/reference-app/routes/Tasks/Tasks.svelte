<script context="module" lang="ts">
  import type { ActionFunction, LoaderFunction } from "@remix-run/router";
  import { Link, Outlet, useLoaderData } from "remix-router-svelte";
  import { deleteTask, getTasks, type Task } from "~/tasks";
  import { sleep } from "~/utils";
  import TaskItem from "~/components/TaskItem.svelte";
  import type { Readable } from "svelte/store";

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

<script lang="ts">
  const tasks = useLoaderData() as Readable<{ tasks: Task[] }>;
</script>

<template>
  <h2>Tasks</h2>
  <ul>
    {#each $tasks.tasks as task (task.id)}
      <li>
        <TaskItem {task} />
      </li>
    {/each}
  </ul>
  <Link to="/tasks/new">Add New Task</Link>
  <Outlet />
</template>
