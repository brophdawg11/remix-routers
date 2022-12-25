import { type Component } from "solid-js";
import { createBrowserRouter, RouteObject, RouterProvider } from "../src";

const App: Component = () => {
  const routes: RouteObject[] = [{ path: "/", element: null }];

  const router = createBrowserRouter(routes);

  return <RouterProvider router={router} />;
};

export default App;
