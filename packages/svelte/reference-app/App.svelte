<script lang="ts">
  import { DataBrowserRouter, json } from "remix-router-svelte";
  import Root from "./routes/Root.svelte";
  import Index from "./routes/Index.svelte";
  import Parent from "./routes/Parent.svelte";
  import Child from "./routes/Child.svelte";
  import Loading from "./components/Loading.svelte";
  import type { RouteObject } from "@remix-run/router";

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
          loader: async () => {
            return json({
              hello: "world",
            });
          },
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

<DataBrowserRouter {routes} fallbackElement={Loading} />
