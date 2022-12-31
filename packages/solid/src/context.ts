import { invariant, Router, RouterState } from "@remix-run/router";
import { Accessor, createContext, useContext } from "solid-js";
import { DataRouteMatch } from "./remix-router-solid";

export const RouterStateContext = createContext<RouterState>();

export const useRouterState = () => {
  const routerState = useContext(RouterStateContext);
  invariant(routerState, "Unable to find routerState");

  return routerState;
};

export const RouterContext = createContext<Router>();

export const useRouter = () => {
  const router = useContext(RouterContext);
  invariant(router, "Unable to find router");

  return router;
};

export const RouteContext = createContext<{
  id: Accessor<string>;
  matches: DataRouteMatch[];
}>();

export const useRoute = () => {
  const routeData = useContext(RouteContext);

  invariant(routeData, "Unable to find useRoute");

  return routeData;
};

export const AsyncErrorContext = createContext<unknown>();

export const useAsyncError = () => {
  return useContext(AsyncErrorContext);
};
