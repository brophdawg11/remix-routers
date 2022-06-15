<script lang="ts">
  import type { RouteObject } from "@remix-run/router";

  import { DataBrowserRouter } from "../src/index";
  import Root from "./routes/Root.svelte";
  import Index from "./routes/Index.svelte";
  import Parent from "./routes/Parent.svelte";
  import Child from "./routes/Child.svelte";

  const routes: RouteObject[] = [
    {
      path: "/",
      element: Root,
      children: [
        {
          index: true,
          element: Index,
        },
        {
          path: "parent",
          element: Parent,
          children: [
            {
              path: "child",
              element: Child,
            },
          ],
        },
      ],
    },
  ];
</script>

<DataBrowserRouter {routes} hydrationData={{}} />
