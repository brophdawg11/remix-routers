<script lang="ts">
  import { type RouteObject, createBrowserRouter, RouterProvider } from "remix-router-svelte";
  import Root from "./routes/Root.svelte";
  import Index from "./routes/Index.svelte";
  import Parent, {
    loader as parentLoader,
  } from "./routes/Nested/Parent.svelte";
  import Child, { loader as childLoader } from "./routes/Nested/Child.svelte";
  import Error, { loader as errorLoader } from "./routes/Error.svelte";
  import Redirect, { loader as redirectLoader } from "./routes/Redirect.svelte";
  import Tasks, {
    loader as tasksLoader,
    action as tasksAction,
  } from "./routes/Tasks/Tasks.svelte";
  import Task, { loader as taskLoader } from "./routes/Tasks/Task.svelte";
  import NewTask, {
    action as newTaskAction,
  } from "./routes/Tasks/NewTask.svelte";

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
          loader: parentLoader,
          element: Parent,
          children: [
            {
              path: "child",
              loader: childLoader,
              element: Child,
            },
            {
              path: "error",
              loader: errorLoader,
              element: Error,
            },
          ],
        },
        {
          path: "redirect",
          loader: redirectLoader,
          element: Redirect,
        },
        {
          path: "error",
          loader: errorLoader,
          element: Error,
        },
        {
          path: "tasks",
          loader: tasksLoader,
          action: tasksAction,
          element: Tasks,
          children: [
            {
              path: ":id",
              loader: taskLoader,
              element: Task,
            },
            {
              path: "new",
              action: newTaskAction,
              element: NewTask,
            },
          ],
        },
      ],
    },
  ];

  const router = createBrowserRouter(routes);
</script>

<RouterProvider {router} fallbackElement="<p>loading...</p>" />
