import {
  createBrowserHistory,
  createRouter,
  type Router,
  type AgnosticRouteObject,
  type HydrationState,
  RouterState,
} from "@remix-run/router";
import {
  Accessor,
  createContext,
  createSignal,
  onCleanup,
  Show,
  type Component,
} from "solid-js";

interface CreateRouterOpts {
  basename?: string;
  hydrationData?: HydrationState;
}

export interface RouteObject extends AgnosticRouteObject {
  children?: RouteObject[];
  element?: Component | null;
}
export interface CreateBrowserRouterOpts extends CreateRouterOpts {
  window?: Window;
}

export function createBrowserRouter(
  routes: RouteObject[],
  { basename, hydrationData, window }: CreateBrowserRouterOpts = {}
) {
  return createRouter({
    history: createBrowserHistory({ window }),
    routes: enhanceManualRouteObjects(routes),
    basename,
    hydrationData,
  }).initialize();
}

const enhanceManualRouteObjects = (routes: RouteObject[]): RouteObject[] => {
  return routes.map((route) => {
    let routeClone = { ...route };
    if (routeClone.hasErrorBoundary == null) {
      // TODO: Wire up once errorElement is added
      // routeClone.hasErrorBoundary = routeClone.errorElement != null;
      routeClone.hasErrorBoundary = false;
    }
    if (routeClone.children) {
      routeClone.children = enhanceManualRouteObjects(routeClone.children);
    }
    return routeClone;
  });
};

export interface RouterContextData {
  router: Router;
  stateRef: Accessor<RouterState>;
}
const RouterContext = createContext<RouterContextData>();

export type RouterProviderProps = { router: Router };

export const RouterProvider = (props: RouterProviderProps) => {
  const { router } = props;

  const [stateRef, setStateRef] = createSignal(router.state);

  router.subscribe((state) => setStateRef(state));

  onCleanup(() => {
    router.dispose();
  });

  return (
    <RouterContext.Provider value={{ stateRef, router }}>
      <Show when={stateRef().initialized} fallback={<p>{"<Fallback />"}</p>}>
        {"<Outlet />"}
      </Show>
    </RouterContext.Provider>
  );
};
