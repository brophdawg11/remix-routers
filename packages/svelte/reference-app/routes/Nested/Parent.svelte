<script lang="ts" context="module">
  import { json, type LoaderFunction } from "@remix-run/router";
  import { sleep } from "~/utils";

  interface LoaderData {
    data: string;
  }

  export const loader: LoaderFunction = async () => {
    await sleep();
    return json<LoaderData>({ data: "parent loader data" });
  };
</script>

<script lang="ts">
  import { Outlet, useLoaderData } from "remix-router-svelte";
  import type { Readable } from "svelte/store";

  let data = useLoaderData() as Readable<LoaderData>;
</script>

<h2>Parent Layout</h2>
<p id="parent">
  Parent data: {$data.data}
</p>
<Outlet />
