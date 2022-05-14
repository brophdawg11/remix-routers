<script lang="ts">
import type { DataRouteObject } from "@remix-run/router";
import { defineComponent, h } from "vue";

import { DataBrowserRouter } from "../remix-router-vue";
import Root from "./Root.vue";
import Tasks, {
  loader as tasksLoader,
  action as tasksAction,
} from "./Tasks.vue";
import Task, { loader as taskLoader } from "./Task.vue";
import NewTask, { action as newTaskAction } from "./NewTask.vue";
import Index, { loader as indexLoader } from "./Index.vue";

export default {
  name: "App",
  components: {
    DataBrowserRouter,
  },
  setup() {
    let routes: DataRouteObject[] = [
      {
        id: "root",
        path: "/",
        element: Root,
        children: [
          {
            id: "index",
            index: true,
            loader: indexLoader,
            element: Index,
          },
          {
            id: "tasks",
            path: "tasks",
            loader: tasksLoader,
            action: tasksAction,
            element: Tasks,
            children: [
              {
                id: "tasksId",
                path: ":id",
                loader: taskLoader,
                element: Task,
              },
              {
                id: "newTask",
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
