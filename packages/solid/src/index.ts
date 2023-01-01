export {
  defer,
  json,
  redirect,
  createBrowserRouter,
  createHashRouter,
  createMemoryRouter,
  RouterProvider,
  Outlet,
  Link,
} from "./remix-router-solid";

export type {
  RouteObject,
  DataRouteObject,
  RouteMatch,
  DataRouteMatch,
  CreateBrowserRouterOpts,
  CreateHashRouterOpts,
  CreateMemoryRouterOps,
} from "./remix-router-solid";

export type { RouteContext, RouteErrorContext } from "./context";

export {
  useNavigationType,
  useLocation,
  useMatches,
  useNavigation,
  useLoaderData,
  useRouteLoaderData,
  useActionData,
  useRouteError,
  useResolvedPath,
  useHref,
  useNavigate,
  useFormAction,
  useSubmit,
  useFetcher,
  useFetchers,
} from "./hooks";

export type {
  NavigateOptions,
  NavigateFunction,
  SubmitFunction,
} from "./hooks";

export { Form } from "./components/Form";

export { Await } from "./components/Await";
