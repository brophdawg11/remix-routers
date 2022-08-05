<script lang="ts">
  import { Link, useFetcher } from "remix-router-svelte";

  export let task;

  let fetcher = useFetcher();
  $: isDeleting = $fetcher.formData != null;
</script>

<span>{task.task}</span>
&nbsp;
<Link to="/tasks/{task.id}">Open</Link>
&nbsp;
<svelte:component
  this={$fetcher.Form}
  style="display: inline"
  action="/tasks"
  method="post"
>
  <button type="submit" name="taskId" value={task.id} disabled={isDeleting}>
    {isDeleting ? "Deleting..." : "❌"}
  </button>
</svelte:component>
