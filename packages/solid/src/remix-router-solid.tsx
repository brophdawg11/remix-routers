import {
  createBrowserHistory,
  createRouter,
  Router,
  AgnosticRouteObject,
  HydrationState,
  AgnosticRouteMatch,
} from "@remix-run/router";
import { Component, JSX, onCleanup, Show } from "solid-js";
import { createStore } from "solid-js/store";
import { RouteWrapper } from "./components/Route";
import {
  RouterContext,
  RouterStateContext,
  useRoute,
  useRouter,
  useRouterState,
} from "./context";
import { shouldProcessLinkClick } from "./dom";

export { json, redirect, defer } from "@remix-run/router";
export type { LoaderFunction, ActionFunction } from "@remix-run/router";

interface CreateRouterOpts {
  basename?: string;
  hydrationData?: HydrationState;
}

export interface RouteObject extends AgnosticRouteObject {
  children?: RouteObject[];
  element?: Component | null;
  errorElement?: Component | null;
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
      routeClone.hasErrorBoundary = routeClone.errorElement != null;
    }
    if (routeClone.children) {
      routeClone.children = enhanceManualRouteObjects(routeClone.children);
    }
    return routeClone;
  });
};

export type RouterProviderProps = { router: Router };

export const RouterProvider = (props: RouterProviderProps) => {
  const { router } = props;

  const [routerState, setRouteState] = createStore(router.state);

  router.subscribe((state) => {
    setRouteState(state);
  });

  onCleanup(() => {
    router.dispose();
  });

  return (
    <RouterContext.Provider value={router}>
      <RouterStateContext.Provider value={routerState}>
        <Show when={routerState.initialized} fallback={<p>{"<Fallback />"}</p>}>
          <OutletImp root />
        </Show>
      </RouterStateContext.Provider>
    </RouterContext.Provider>
  );
};

export const Outlet = () => {
  return <OutletImp root={false} />;
};

type OutletImpProps = { root: boolean };

const OutletImp = (props: OutletImpProps) => {
  const routerState = useRouterState();
  const routeContext = () => (props.root ? null : useRoute());

  const idx = () => {
    return routerState.matches.findIndex(
      (m) => m.route.id === routeContext()?.id()
    );
  };

  const matchToRender = () => {
    return routerState.matches[idx() + 1] as DataRouteMatch | undefined;
  };

  return (
    <>
      {(() => {
        const matchToRenderValue = matchToRender();
        if (idx() < 0 && !props.root) {
          throw new Error("Unable to find matching router for Outlet");
        }
        return (
          <Show when={matchToRenderValue} fallback={null}>
            <RouteWrapper
              id={() => matchToRenderValue?.route.id!}
              root={props.root}
              match={matchToRenderValue!}
            >
              {matchToRenderValue?.route.element!}
            </RouteWrapper>
          </Show>
        );
      })()}
    </>
  );
};

export interface LinkProps
  extends Omit<JSX.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  to: string;
}
/**
 *
 * TODO:
 * - Add support for relativeLink in `to` prop
 */
export const Link = (props: LinkProps) => {
  const router = useRouter();

  return (
    <a
      href={props.to}
      onClick={(e) => {
        const target =
          typeof props.target === "string" ? props.target : undefined;

        if (!shouldProcessLinkClick(e, target)) {
          return;
        }

        e.preventDefault();
        router.navigate(props.to);
      }}
    >
      {props.children}
    </a>
  );
};
