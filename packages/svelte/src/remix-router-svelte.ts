import { getRouteContext, getRouterContext } from "./contexts";

export function useLoaderData() {
  let ctx = getRouteContext();
  return useRouteLoaderData(ctx.id);
}

export function useRouteLoaderData(routeId: string) {
  let ctx = getRouterContext();
  let data: unknown;
  ctx.state.subscribe((state) => {
    data = state.loaderData[routeId];
  });
  return data;
}

export { DataBrowserRouter } from "./components/DataBrowserRouter";
export { Outlet } from "./components/Outlet";
export { Link } from "./components/Link";
export { shouldProcessLinkClick } from "./dom";
export {
  getRouteContext,
  getRouterContext,
  RouteContextSymbol,
  RouterContextSymbol,
} from "./contexts";

export { json, redirect, isRouteErrorResponse } from "@remix-run/router";
