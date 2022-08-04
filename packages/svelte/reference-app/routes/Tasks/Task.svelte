<script context="module" lang="ts">
  import type { LoaderFunction } from "@remix-run/router";
  import { useLoaderData } from "remix-router-svelte";
  import { getTasks, type Task } from "~/tasks";
  import { sleep } from "~/utils";
  import type { Readable } from "svelte/store";

  export const loader: LoaderFunction = async ({ params }) => {
    await sleep();
    return {
      task: getTasks().find((t) => t.id === params.id),
    };
  };
</script>

<script lang="ts">
  const data = useLoaderData() as Readable<{ task: Task }>;
</script>

<h3>Task</h3>
<p>
  {$data.task.task}
</p>
