<script lang="ts">
import type { RouteObject } from "@remix-run/router";
import { DataBrowserRouter } from "remix-router-vue";
import { h } from "vue";

import Root from "./app/routes/Root.vue";
import Index from "./app/routes/Index.vue";
import Page1, { loader as page1Loader } from "./app/routes/Page1.vue";
import Tasks, {
  loader as tasksLoader,
  action as tasksAction,
} from "./app/routes/Tasks.vue";
import Task, { loader as taskLoader } from "./app/routes/Task.vue";
import NewTask, { action as newTaskAction } from "./app/routes/NewTask.vue";

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
            path: "page1",
            loader: page1Loader,
            element: Page1,
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
