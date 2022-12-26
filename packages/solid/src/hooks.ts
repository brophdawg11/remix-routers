import { To } from "@remix-run/router";
import { Accessor } from "solid-js";
import { getRouteContext, getRouterContext } from "./remix-router-solid";

export const useNavigationType = () => {
  const ctx = getRouterContext();
  return () => ctx.stateRef().historyAction;
};

export const useLocation = () => {
  const ctx = getRouterContext();
  return () => ctx.stateRef().location;
};

export const useMatches = () => {
  const ctx = getRouterContext();
  return () =>
    ctx.stateRef().matches.map((match) => ({
      id: match.route.id,
      pathname: match.pathname,
      params: match.params,
      data: ctx.stateRef().loaderData[match.route.id] as unknown,
      handle: match.route.handle as unknown,
    }));
};

export const useNavigation = () => {
  const ctx = getRouterContext();
  return () => ctx.stateRef().navigation;
};

/**
 * TODO:
 * - Add support for relative paths
 */
export const useNavigate = () => {
  const { router } = getRouterContext();

  const navigate = (to: To | number) => {
    if (typeof to === "number") {
      router.navigate(to);
      return;
    }

    router.navigate(to);
  };

  return navigate;
};

export const useRouteLoaderData = (routeId: string) => {
  const ctx = getRouterContext();
  return () => ctx.stateRef().loaderData[routeId] as unknown;
};

export const useLoaderData = <Data>(): Accessor<Data> => {
  return useRouteLoaderData(getRouteContext().id) as Accessor<Data>;
};