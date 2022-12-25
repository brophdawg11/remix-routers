import { type Component } from "solid-js";
import {
  createBrowserRouter,
  RouteObject,
  RouterProvider,
} from "remix-router-solid";
import { Root } from "./routes/Root";
import { Child } from "./routes/child";
import { Index } from "./routes/Index";

const App: Component = () => {
  const routes: RouteObject[] = [
    {
      path: "/",
      element: Root,
      children: [
        { index: true, element: Index },
        { path: "/child", element: Child },
      ],
    },
  ];

  const router = createBrowserRouter(routes);

  return <RouterProvider router={router} />;
};

export default App;
