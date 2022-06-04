<script lang="ts">
import type { RouteObject } from "@remix-run/router";
import { DataBrowserRouter } from "remix-router-vue";
import { h } from "vue";

import Root from "./routes/Root.vue";
import Child, { loader as childLoader } from "./routes/nested/Child.vue";
import Index from "./routes/Index.vue";
import Parent, { loader as parentLoader } from "./routes/nested/Parent.vue";
import Redirect, { loader as redirectLoader } from "~/routes/Redirect.vue";
import Tasks, {
  loader as tasksLoader,
  action as tasksAction,
} from "./routes/tasks/Tasks.vue";
import Task, { loader as taskLoader } from "./routes/tasks/Task.vue";
import NewTask, { action as newTaskAction } from "./routes/tasks/NewTask.vue";

export default {
  name: "App",
  components: {
    DataBrowserRouter,
  },
  setup() {
    let routes: RouteObject[] = [
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
            ],
          },
          {
            path: "redirect",
            loader: redirectLoader,
            element: Redirect,
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

    return {
      routes,
      fallbackElement: () => h("p", "Loading..."),
    };
  },
};
</script>

<template>
  <DataBrowserRouter :routes="routes" :fallbackElement="fallbackElement" />
</template>
