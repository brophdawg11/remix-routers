<script lang="ts" context="module">
  import type { LoaderFunction } from "@remix-run/router";
  import { json, useLoaderData } from "remix-router-svelte";
  import { sleep } from "~/utils";

  interface LoaderData {
    data: string;
  }

  export const loader: LoaderFunction = async () => {
    await sleep();
    return json<LoaderData>({ data: "child loader data" });
  };
</script>

<script lang="ts">
  const { data } = useLoaderData() as LoaderData;
</script>

<h3>Child Route</h3>
<p id="child">Child data: {data}</p>
