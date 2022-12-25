import { type Component } from "solid-js";
import {
  createBrowserRouter,
  RouteObject,
  RouterProvider,
} from "remix-router-solid";
import { Root } from "./routes/Root";
import { Index } from "./routes/Index";
import { Parent, parentLoader } from "./routes/nested/parent";
import { Child, childLoader } from "./routes/nested/child";

const App: Component = () => {
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
          children: [{ path: "child", element: Child, loader: childLoader }],
        },
      ],
    },
  ];

  const router = createBrowserRouter(routes);

  return <RouterProvider router={router} />;
};

export default App;
