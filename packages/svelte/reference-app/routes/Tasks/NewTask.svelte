<script context="module" lang="ts">
  import { type ActionFunction, redirect } from "@remix-run/router";
  import { Form, useNavigation } from "remix-router-svelte";
  import { addTask } from "~/tasks";
  import { sleep } from "~/utils";

  export const action: ActionFunction = async ({ request }) => {
    await sleep();
    let formData = await request.formData();
    addTask(formData.get("newTask") as string);
    return redirect("/tasks", { status: 302 });
  };
</script>

<script lang="ts">
  const navigation = useNavigation();
  $: isAdding = $navigation.state !== "idle";
</script>

<template>
  <h3>New Task</h3>
  <Form method="post">
    <input name="newTask" placeholder="Add a task..." disabled={isAdding} />
    <button type="submit" disabled={isAdding}>
      {isAdding ? "Adding..." : "Add"}
    </button>
  </Form>
</template>
