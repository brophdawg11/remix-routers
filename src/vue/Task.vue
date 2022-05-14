<script lang="ts">
import type { LoaderFunction } from "@remix-run/router";
import { defineComponent } from "vue";

import { useLoaderData } from "../remix-router-vue";
import { getTasks } from "../tasks";

export const loader: LoaderFunction = async ({ params }) => {
  await new Promise((r) => setTimeout(r, 1000));
  return {
    task: getTasks().find((t) => t.id === params.id),
  };
};

export default defineComponent({
  name: "Task",
  setup() {
    let data = useLoaderData();
    return {
      data,
    };
  },
});
</script>

<template>
  <h4>Task</h4>
  <p>
    {{ data.task.task }}
  </p>
</template>
