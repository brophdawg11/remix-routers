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
import { Boundary } from "./components/Boundary";
import { ErrorComp, errorLoader } from "./routes/Error";
import { Redirect, redirectLoader } from "./routes/Redirect";

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
          errorElement: Boundary,
          children: [
            { path: "child", element: Child, loader: childLoader },
            { path: "error", loader: errorLoader, element: ErrorComp },
          ],
        },
        { path: "error", loader: errorLoader, element: ErrorComp },
        { path: "redirect", loader: redirectLoader, element: Redirect },
      ],
    },
  ];

  const router = createBrowserRouter(routes);

  return <RouterProvider router={router} />;
};

export default App;
