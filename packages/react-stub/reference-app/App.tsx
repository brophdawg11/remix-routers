import { DataBrowserRouter, Route } from "react-router-dom";

import Index from "./routes/Index";
import Page1, { loader as page1Loader } from "./routes/Page1";
import Root from "./routes/Root";
import Tasks, {
  action as tasksAction,
  loader as tasksLoader,
} from "./routes/Tasks";
import Task, { loader as taskLoader } from "./routes/Task";
import NewTask, { action as newTaskAction } from "./routes/NewTask";

export default function App() {
  return (
    <DataBrowserRouter fallbackElement={<p>Loading...</p>}>
      <Route path="/" element={<Root />}>
        <Route index element={<Index />} />
        <Route path="page1" loader={page1Loader} element={<Page1 />} />
        <Route
          path="tasks"
          loader={tasksLoader}
          action={tasksAction}
          element={<Tasks />}
        >
          <Route path=":id" loader={taskLoader} element={<Task />} />
          <Route path="new" action={newTaskAction} element={<NewTask />} />
        </Route>
      </Route>
    </DataBrowserRouter>
  );
}
