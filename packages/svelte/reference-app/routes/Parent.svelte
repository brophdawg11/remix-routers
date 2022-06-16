<script lang="ts">
  import { Outlet, useLoaderData } from "remix-router-svelte";
  let data = useLoaderData();
</script>

<h1>Parent route!</h1>
<pre>
  loader data: {JSON.stringify(data, null, 2)}
</pre>
<Outlet />
