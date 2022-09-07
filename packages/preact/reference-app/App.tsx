import { DataBrowserRouter, Route } from "remix-router-preact";

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

export default function App() {
  return (
    <DataBrowserRouter fallbackElement={<p>Loading...</p>}>
      <Route path="/" element={<Root />}>
        <Route index element={<Index />} />
        <Route
          path="parent"
          loader={parentLoader}
          element={<Parent />}
          errorElement={<Boundary />}
        >
          <Route path="child" loader={childLoader} element={<Child />} />
          <Route
            path="error"
            loader={errorLoader}
            element={<ErrorComponent />}
          />
        </Route>
        <Route path="redirect" loader={redirectLoader} element={<Redirect />} />
        <Route path="error" loader={errorLoader} element={<ErrorComponent />} />
        <Route
          path="tasks"
          loader={tasksLoader}
          action={tasksAction}
          element={<Tasks />}
        >
          <Route path=":id" loader={taskLoader} element={<Task />} />
          <Route path="new" action={newTaskAction} element={<NewTask />} />
        </Route>
        <Route path="defer" loader={deferLoader} element={<Defer />} />
      </Route>
    </DataBrowserRouter>
  );
}
