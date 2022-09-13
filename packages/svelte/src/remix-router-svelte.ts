import {
  Action as NavigationType,
  resolveTo,
  type Fetcher,
  type FormEncType,
  type FormMethod,
  type Navigation,
  type Router,
  type Location,
  type HydrationState,
  createRouter,
  createMemoryHistory,
  type AgnosticRouteObject,
  type AgnosticRouteMatch,
  createBrowserHistory,
  createHashHistory,
} from "@remix-run/router";
import { onDestroy, type SvelteComponent } from "svelte";
import { derived, get, writable, type Readable } from "svelte/store";
import { getRouteContext, getRouterContext } from "./contexts";
import { getFormSubmissionInfo, type SubmitOptions } from "./dom";

// Create svelte-specific types from the agnostic types in @remix-run/router to
// export from remix-router-svelte
export interface RouteObject extends AgnosticRouteObject {
  children?: RouteObject[];
  element?: typeof SvelteComponent | null;
  // TODO: Not yet implemented
  // errorElement?: typeof SvelteComponent | null;
}

export interface DataRouteObject extends RouteObject {
  children?: DataRouteObject[];
  id: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface RouteMatch<
  ParamKey extends string = string,
  RouteObjectType extends RouteObject = RouteObject
> extends AgnosticRouteMatch<ParamKey, RouteObjectType> {}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface DataRouteMatch extends RouteMatch<string, DataRouteObject> {}

interface CreateRouterOpts {
  basename?: string;
  hydrationData?: HydrationState;
}

interface CreateMemoryRouterOpts extends CreateRouterOpts {
  initialEntries?: string[];
  initialIndex?: number;
}

interface CreateBrowserRouterOpts extends CreateRouterOpts {
  window?: Window;
}

interface CreateHashRouterOpts extends CreateRouterOpts {
  window?: Window;
}

export function createMemoryRouter(
  routes: RouteObject[],
  {
    basename,
    hydrationData,
    initialEntries,
    initialIndex,
  }: CreateMemoryRouterOpts = {}
) {
  return createRouter({
    basename,
    history: createMemoryHistory({
      initialEntries,
      initialIndex,
    }),
    hydrationData,
    routes: enhanceManualRouteObjects(routes),
  }).initialize();
}

export function createBrowserRouter(
  routes: RouteObject[],
  { basename, hydrationData, window }: CreateBrowserRouterOpts = {}
) {
  return createRouter({
    basename,
    history: createBrowserHistory({ window }),
    hydrationData,
    routes: enhanceManualRouteObjects(routes),
  }).initialize();
}

export function createHashRouter(
  routes: RouteObject[],
  { basename, hydrationData, window }: CreateHashRouterOpts = {}
) {
  return createRouter({
    basename,
    history: createHashHistory({ window }),
    hydrationData,
    routes: enhanceManualRouteObjects(routes),
  }).initialize();
}
//#endregion

type FetcherWithComponents<TData> = Fetcher<TData> & {
  Form: any;
  // TODO: abstract via useSubmitImpl
  submit(target: SubmitTarget, options?: SubmitOptions): void;
  load: (href: string) => void;
};

type SubmitTarget =
  | HTMLFormElement
  | HTMLButtonElement
  | HTMLInputElement
  | FormData
  | URLSearchParams
  | { [name: string]: string }
  | null;

export function useLoaderData() {
  let ctx = getRouteContext();
  return useRouteLoaderData(ctx.id);
}

export function useRouteLoaderData(routeId: string) {
  let ctx = getRouterContext();
  return derived(ctx.state, ({ loaderData }, set) => {
    // this guard protects against returning undefined due to differences in the Svelte and Vue reactivity models.
    // I want to understand this more
    if (loaderData[routeId]) {
      set(loaderData[routeId]);
    }
  });
}

export function useLocation(): Readable<Location> {
  let ctx = getRouterContext();
  return derived(ctx.state, ({ location }) => location);
}

export function useNavigation(): Readable<Navigation> {
  let ctx = getRouterContext();
  return derived(ctx.state, ({ navigation }) => navigation);
}

export function useNavigate(): Router["navigate"] {
  let ctx = getRouterContext();
  return ctx.router.navigate;
}

export function useNavigationType(): Readable<NavigationType> {
  let ctx = getRouterContext();
  return derived(ctx.state, ({ historyAction }) => historyAction);
}

export function useMatches() {
  let ctx = getRouterContext();

  return derived(ctx.state, ({ matches, loaderData }) =>
    matches.map((match) => ({
      id: match.route.id,
      pathname: match.pathname,
      params: match.params,
      data: loaderData[match.route.id] as unknown,
      handle: match.route.handle as unknown,
    }))
  );
}

export function useFormAction(action = "."): string {
  let { router } = getRouterContext();
  let route = getRouteContext();
  let location = useLocation();
  let { pathname } = get(location);

  let path = resolveTo(
    action,
    router.state.matches.map((match) => match.pathnameBase),
    pathname
  );

  let search = path.search;
  if (action === "." && route.index) {
    search = search ? search.replace(/^\?/, "?index&") : "?index";
  }

  return path.pathname + search;
}

let fetcherId = 0;
export function useFetcher<TData = unknown>(): Readable<
  FetcherWithComponents<TData>
> {
  let { router, state } = getRouterContext();
  let routeId = getRouteContext().id;
  let defaultAction = useFormAction();
  let fetcherKey = String(++fetcherId);
  let fetcherStore = writable<Fetcher<TData>>(
    router.getFetcher<TData>(fetcherKey)
  );
  let unsub = state.subscribe(() => {
    fetcherStore.set(router.getFetcher<TData>(fetcherKey));
  });

  class FetcherForm extends Form {
    constructor(config: { props: Record<string, unknown> }) {
      config.props = { ...config.props, fetcherKey };
      super(config);
    }
  }

  onDestroy(() => {
    router.deleteFetcher(fetcherKey);
    unsub();
  });

  return derived(fetcherStore, (fetcher) => {
    return {
      ...fetcher,
      Form: FetcherForm,
      submit(target: SubmitTarget, options = {}) {
        return submitForm(
          router,
          defaultAction,
          target,
          options,
          fetcherKey,
          routeId
        );
      },
      load(href: string) {
        return router.fetch(fetcherKey, routeId, href);
      },
    };
  });
}

export { default as RouterProvider } from "./components/RouterProvider.svelte";
export { default as Outlet } from "./components/Outlet.svelte";
export { default as Link } from "./components/Link.svelte";
import { default as Form } from "./components/Form.svelte";
export { Form };
export { shouldProcessLinkClick } from "./dom";
export { getRouteContext, getRouterContext } from "./contexts";

export { json, redirect, isRouteErrorResponse } from "@remix-run/router";

/// utils
export function submitForm(
  router: Router,
  defaultAction: string,
  target: SubmitTarget,
  options: SubmitOptions = {},
  fetcherKey?: string,
  routeId?: string
): void {
  if (typeof document === "undefined") {
    throw new Error("Unable to submit during server render");
  }

  let { method, encType, formData, url } = getFormSubmissionInfo(
    target,
    defaultAction,
    options
  );

  let href = url.pathname + url.search;
  let opts = {
    replace: options.replace,
    formData,
    formMethod: method as FormMethod,
    formEncType: encType as FormEncType,
  };
  if (fetcherKey) {
    router.fetch(fetcherKey, routeId, href, opts);
  } else {
    router.navigate(href, opts);
  }
}

function enhanceManualRouteObjects(routes: RouteObject[]): RouteObject[] {
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
}
