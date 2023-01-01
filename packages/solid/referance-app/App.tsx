import type { Component } from "solid-js";
import {
  createBrowserRouter,
  RouteObject,
  RouterProvider,
} from "remix-router-solid";
import { Root } from "./routes/Root";
import { Index } from "./routes/Index";
import { Parent, parentLoader } from "./routes/nested/parent";
import { Child, childLoader } from "./routes/nested/child";
import { Boundary } from "./components/Boundary";
import { ErrorComp, errorLoader } from "./routes/Error";
import { Redirect, redirectLoader } from "./routes/Redirect";
import { Defer, deferLoader } from "./routes/Defer";
import { Tasks, tasksAction, tasksLoader } from "./routes/tasks/Tasks";
import { Task, taskLoader } from "./routes/tasks/Task";
import { NewTask, newTaskAction } from "./routes/tasks/NewTask";

export const App: Component = () => {
  const routes: RouteObject[] = [
    {
      path: "/",
      element: Root,
      children: [
        { index: true, element: Index },
        {
          path: "parent",
          element: Parent,
          loader: parentLoader,
          errorElement: Boundary,
          children: [
            { path: "child", element: Child, loader: childLoader },
            { path: "error", loader: errorLoader, element: ErrorComp },
          ],
        },
        { path: "error", loader: errorLoader, element: ErrorComp },
        { path: "redirect", loader: redirectLoader, element: Redirect },
        {
          path: "defer",
          loader: deferLoader,
          element: Defer,
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
            { path: "new", action: newTaskAction, element: NewTask },
          ],
        },
      ],
    },
  ];

  const router = createBrowserRouter(routes);
    
    const fetcher1 = router.getFetcher("1");
    const fetcher2 = router.getFetcher("2");


  return <RouterProvider router={router} />;
};

