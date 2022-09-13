import { createBrowserRouter, RouterProvider } from "react-router-dom";

import Boundary from "~/components/Boundary";
import Index from "~/routes/Index";
import Parent, { loader as parentLoader } from "~/routes/nested/Parent";
import Child, { loader as childLoader } from "~/routes/nested/Child";
import Redirect, { loader as redirectLoader } from "./routes/Redirect";
import ErrorComponent, { loader as errorLoader } from "./routes/Error";
import Root from "~/routes/Root";
import Tasks, {
  action as tasksAction,
  loader as tasksLoader,
} from "~/routes/tasks/Tasks";
import Task, { loader as taskLoader } from "~/routes/tasks/Task";
import NewTask, { action as newTaskAction } from "~/routes/tasks/NewTask";
import Defer, { loader as deferLoader } from "~/routes/Defer";

let routes = [
  {
    path: "/",
    element: <Root />,
    children: [
      {
        index: true,
        element: <Index />,
      },
      {
        path: "parent",
        loader: parentLoader,
        element: <Parent />,
        errorElement: <Boundary />,
        children: [
          {
            path: "child",
            loader: childLoader,
            element: <Child />,
          },
          {
            path: "error",
            loader: errorLoader,
            element: <ErrorComponent />,
          },
        ],
      },
      {
        path: "redirect",
        loader: redirectLoader,
        element: <Redirect />,
      },
      {
        path: "error",
        loader: errorLoader,
        element: <ErrorComponent />,
      },
      {
        path: "tasks",
        loader: tasksLoader,
        action: tasksAction,
        element: <Tasks />,
        children: [
          {
            path: ":id",
            loader: taskLoader,
            element: <Task />,
          },
          {
            path: "new",
            action: newTaskAction,
            element: <NewTask />,
          },
        ],
      },
      {
        path: "defer",
        loader: deferLoader,
        element: <Defer />,
      },
    ],
  },
];

let router = createBrowserRouter(routes);

export default function App() {
  return <RouterProvider router={router} fallbackElement={<p>Loading...</p>} />;
}
