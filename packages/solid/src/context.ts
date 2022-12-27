import { invariant, Router, RouterState } from "@remix-run/router";
import { Accessor, createContext, useContext } from "solid-js";

export const RouterStateContext = createContext<RouterState>();

export const useRouterState = () => {
  const routerState = useContext(RouterStateContext);
  invariant(routerState, "Unable to find routerState");

  return routerState;
};

// Immutable Router
export const RouterContext = createContext<Omit<Router, "state">>();

export const useRouter = () => {
  const router = useContext(RouterContext);
  invariant(router, "Unable to find router");

  return router;
};

export const RouteContext = createContext<{ id: Accessor<string> }>();

export const useRoute = () => {
  const routeData = useContext(RouteContext);

  invariant(routeData, "Unable to find useRoute");

  return routeData;
};
