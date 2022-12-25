import { type Component } from "solid-js";
import {
  createBrowserRouter,
  RouteObject,
  RouterProvider,
} from "remix-router-solid";
import { Root } from "./routes/Root";
import { Child } from "./routes/child";

const App: Component = () => {
  const routes: RouteObject[] = [
    {
      path: "/",
      element: Root,
      children: [{ path: "/child", element: Child }],
    },
  ];

  const router = createBrowserRouter(routes);

  return <RouterProvider router={router} />;
};

export default App;
