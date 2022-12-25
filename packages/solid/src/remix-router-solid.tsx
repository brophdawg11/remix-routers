import {
  createBrowserHistory,
  createRouter,
  type Router,
  type AgnosticRouteObject,
  type HydrationState,
  RouterState,
  invariant,
  AgnosticRouteMatch,
  Location,
} from "@remix-run/router";
import {
  Accessor,
  createContext,
  createSignal,
  onCleanup,
  Show,
  useContext,
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

export interface DataRouteObject extends RouteObject {
  children?: DataRouteObject[];
  id: string;
}

export interface RouteMatch<
  ParamKey extends string = string,
  RouteObjectType extends RouteObject = RouteObject
> extends AgnosticRouteMatch<ParamKey, RouteObjectType> {}

export interface DataRouteMatch extends RouteMatch<string, DataRouteObject> {}

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

const getRouterContext = () => {
  const ctx = useContext(RouterContext);
  invariant(ctx != null, "No Router Context Available");
  return ctx;
};

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
        <OutletImp root />
      </Show>
    </RouterContext.Provider>
  );
};

export type OutletImpProps = { root: boolean };

const OutletImp = (props: OutletImpProps) => {
  const { router, stateRef } = getRouterContext();
  const routeContext = props.root ? null : getRouteContext();
  const { matches } = router.state;

  const idx = matches.findIndex((m) => m.route.id === routeContext?.id);

  if (idx < 0 && !props.root) {
    throw new Error(
      `Unable to find <Outlet /> match for route id ${
        routeContext?.id || "_root_"
      }`
    );
  }

  const matchToRender = matches[idx + 1];

  return (
    <Show when={matchToRender} fallback={null}>
      <RouteWrapper
        location={stateRef().location}
        match={matchToRender}
        root={props.root}
      />
    </Show>
  );
};

export interface RouteContextData {
  id: string;
  matches: DataRouteMatch[];
  index: boolean;
}

const RouteContext = createContext<RouteContextData>();

const getRouteContext = () => {
  const ctx = useContext(RouteContext);
  invariant(ctx != null, "No Route Context Available");
  return ctx;
};

type RouteWrapperTypes = {
  match: DataRouteMatch;
  location: Location;
  root?: boolean;
};

const RouteWrapper = (props: RouteWrapperTypes) => {
  const { stateRef } = getRouterContext();

  return (
    <RouteContext.Provider
      value={{
        id: props.match.route.id,
        index: props.match.route.index === true,
        matches: stateRef().matches.slice(
          0,
          stateRef().matches.findIndex(
            (m) => m.route.id === props.match.route.id
          ) + 1
        ),
      }}
    >
      {props.match.route.element!({})}
    </RouteContext.Provider>
  );
};