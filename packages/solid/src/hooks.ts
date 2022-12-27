import { To } from "@remix-run/router";
import { Accessor, useContext } from "solid-js";
import { RouteErrorContext } from "./components/Error";
import { useRoute, useRouter, useRouterState } from "./context";

export const useNavigationType = () => {
  const routerState = useRouterState();
  return () => routerState.historyAction;
};

export const useLocation = () => {
  const routerState = useRouterState();
  return () => routerState.location;
};

export const useMatches = () => {
  const routerState = useRouterState();
  return () =>
    routerState.matches.map((match) => ({
      id: match.route.id,
      pathname: match.pathname,
      params: match.params,
      data: routerState.loaderData[match.route.id] as unknown,
      handle: match.route.handle as unknown,
    }));
};

export const useNavigation = () => {
  const routerState = useRouterState();
  return () => routerState.navigation;
};

/**
 * TODO:
 * - Add support for relative paths
 */
export const useNavigate = () => {
  const router = useRouter();

  const navigate = (to: To | number) => {
    if (typeof to === "number") {
      router.navigate(to);
      return;
    }

    router.navigate(to);
  };

  return navigate;
};

export const useRouteLoaderData = (routeId: Accessor<string>) => {
  const routerState = useRouterState();
  return () => routerState.loaderData[routeId()] as unknown;
};

export const useLoaderData = <Data>(): Accessor<Data> => {
  return useRouteLoaderData(useRoute().id) as Accessor<Data>;
};

export const useRouteError = () => {
  const routerState = useRouterState();
  const routeId = useRoute().id;
  const errorCtx = useContext(RouteErrorContext);

  return () => errorCtx?.error || (routerState.errors?.[routeId()] as unknown);
};
