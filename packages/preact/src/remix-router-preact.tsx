/* eslint-disable no-unused-vars */
import * as Preact from "preact";
import * as PreactHooks from "preact/hooks";
import type {
  TrackedPromise,
  History,
  Location,
  StaticHandlerContext,
  To,
  AgnosticRouteObject,
  AgnosticRouteMatch,
  ParamParseKey,
  Params,
  Path,
  PathMatch,
  PathPattern,
  Router as RemixRouter,
  InitialEntry,
  MemoryHistory,
  RouterState,
  BrowserHistory,
  Fetcher,
  FormEncType,
  FormMethod,
  GetScrollRestorationKeyFunction,
  HashHistory,
  HydrationState,
} from "@remix-run/router";
import {
  AbortedDeferredError,
  Action as NavigationType,
  createRouter,
  invariant,
  isRouteErrorResponse,
  joinPaths,
  matchPath,
  matchRoutes,
  parsePath,
  resolveTo,
  warning,
  stripBasename,
  createMemoryHistory,
  createBrowserHistory,
  createHashHistory,
  createPath,
} from "@remix-run/router";

import { forwardRef } from "./forward-ref";
import { useSyncExternalStore as useSyncExternalStoreShim } from "./use-sync-external-store-shim";

import type { SubmitOptions, URLSearchParamsInit } from "./dom";
import {
  createSearchParams,
  defaultMethod,
  getFormSubmissionInfo,
  getSearchParamsForLocation,
  shouldProcessLinkClick,
} from "./dom";

// Re-exports from remix router
export type {
  LoaderFunction,
  LoaderFunctionArgs,
  ActionFunction,
  ActionFunctionArgs,
} from "@remix-run/router";
export { defer, isRouteErrorResponse, json, redirect } from "@remix-run/router";

// Create react-specific types from the agnostic types in @remix-run/router to
// export from react-router
export interface RouteObject extends AgnosticRouteObject {
  children?: RouteObject[];
  element?: Preact.ComponentChild | null;
  errorElement?: Preact.ComponentChild | null;
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

export function createMemoryRouter(
  routes: RouteObject[],
  opts?: {
    basename?: string;
    hydrationData?: HydrationState;
    initialEntries?: string[];
    initialIndex?: number;
  }
): RemixRouter {
  return createRouter({
    basename: opts?.basename,
    history: createMemoryHistory({
      initialEntries: opts?.initialEntries,
      initialIndex: opts?.initialIndex,
    }),
    hydrationData: opts?.hydrationData,
    routes: enhanceManualRouteObjects(routes),
  }).initialize();
}

export function createBrowserRouter(
  routes: RouteObject[],
  opts?: {
    basename?: string;
    hydrationData?: HydrationState;
    window?: Window;
  }
): RemixRouter {
  return createRouter({
    basename: opts?.basename,
    history: createBrowserHistory({ window }),
    hydrationData: opts?.hydrationData,
    routes: enhanceManualRouteObjects(routes),
  }).initialize();
}

export function createHashRouter(
  routes: RouteObject[],
  opts?: {
    basename?: string;
    hydrationData?: HydrationState;
    window?: Window;
  }
): RemixRouter {
  return createRouter({
    basename: opts?.basename,
    history: createHashHistory({ window }),
    hydrationData: opts?.hydrationData,
    routes: enhanceManualRouteObjects(routes),
  }).initialize();
}

// Contexts for data routers
export const DataStaticRouterContext =
  Preact.createContext<StaticHandlerContext | null>(null);

export interface DataRouterContextObject extends NavigationContextObject {
  router: RemixRouter;
}

export const DataRouterContext =
  Preact.createContext<DataRouterContextObject | null>(null);

export const DataRouterStateContext = Preact.createContext<
  RemixRouter["state"] | null
>(null);

export const AwaitContext = Preact.createContext<TrackedPromise | null>(null);

export type RelativeRoutingType = "route" | "path";

export interface NavigateOptions {
  replace?: boolean;
  state?: any;
  preventScrollReset?: boolean;
  relative?: RelativeRoutingType;
}

/**
 * A Navigator is a "location changer"; it's how you get to different locations.
 *
 * Every history instance conforms to the Navigator interface, but the
 * distinction is useful primarily when it comes to the low-level <Router> API
 * where both the location and a navigator must be provided separately in order
 * to avoid "tearing" that may occur in a suspense-enabled app if the action
 * and/or location were to be read directly from the history instance.
 */
export interface Navigator {
  createHref: History["createHref"];
  go: History["go"];
  push(to: To, state?: any, opts?: NavigateOptions): void;
  replace(to: To, state?: any, opts?: NavigateOptions): void;
}

interface NavigationContextObject {
  basename: string;
  navigator: Navigator;
  static: boolean;
}

export const NavigationContext = Preact.createContext<NavigationContextObject>(
  null!
);

interface LocationContextObject {
  location: Location;
  navigationType: NavigationType;
}

export const LocationContext = Preact.createContext<LocationContextObject>(
  null!
);

export interface RouteContextObject {
  outlet: any | null;
  matches: RouteMatch[];
}

export const RouteContext = Preact.createContext<RouteContextObject>({
  outlet: null,
  matches: [],
});

export const RouteErrorContext = Preact.createContext<any>(null);

/**
 * Returns the full href for the given "to" value. This is useful for building
 * custom links that are also accessible and preserve right-click behavior.
 *
 * @see https://reactrouter.com/docs/en/v6/hooks/use-href
 */
export function useHref(
  to: To,
  { relative }: { relative?: RelativeRoutingType } = {}
): string {
  invariant(
    useInRouterContext(),
    // TODO: This error is probably because they somehow have 2 versions of the
    // router loaded. We can help them understand how to avoid that.
    `useHref() may be used only in the context of a <Router> component.`
  );

  let { basename, navigator } = PreactHooks.useContext(NavigationContext);
  let { hash, pathname, search } = useResolvedPath(to, { relative });

  let joinedPathname = pathname;

  // If we're operating within a basename, prepend it to the pathname prior
  // to creating the href.  If this is a root navigation, then just use the raw
  // basename which allows the basename to have full control over the presence
  // of a trailing slash on root links
  if (basename !== "/") {
    joinedPathname =
      pathname === "/" ? basename : joinPaths([basename, pathname]);
  }

  return navigator.createHref({ pathname: joinedPathname, search, hash });
}

/**
 * Returns true if this component is a descendant of a <Router>.
 *
 * @see https://reactrouter.com/docs/en/v6/hooks/use-in-router-context
 */
export function useInRouterContext(): boolean {
  return PreactHooks.useContext(LocationContext) != null;
}

/**
 * Returns the current location object, which represents the current URL in web
 * browsers.
 *
 * Note: If you're using this it may mean you're doing some of your own
 * "routing" in your app, and we'd like to know what your use case is. We may
 * be able to provide something higher-level to better suit your needs.
 *
 * @see https://reactrouter.com/docs/en/v6/hooks/use-location
 */
export function useLocation(): Location {
  invariant(
    useInRouterContext(),
    // TODO: This error is probably because they somehow have 2 versions of the
    // router loaded. We can help them understand how to avoid that.
    `useLocation() may be used only in the context of a <Router> component.`
  );

  return PreactHooks.useContext(LocationContext).location;
}

/**
 * Returns the current navigation action which describes how the router came to
 * the current location, either by a pop, push, or replace on the history stack.
 *
 * @see https://reactrouter.com/docs/en/v6/hooks/use-navigation-type
 */
export function useNavigationType(): NavigationType {
  return PreactHooks.useContext(LocationContext).navigationType;
}

/**
 * Returns true if the URL for the given "to" value matches the current URL.
 * This is useful for components that need to know "active" state, e.g.
 * <NavLink>.
 *
 * @see https://reactrouter.com/docs/en/v6/hooks/use-match
 */
export function useMatch<
  ParamKey extends ParamParseKey<Path>,
  Path extends string
>(pattern: PathPattern<Path> | Path): PathMatch<ParamKey> | null {
  invariant(
    useInRouterContext(),
    // TODO: This error is probably because they somehow have 2 versions of the
    // router loaded. We can help them understand how to avoid that.
    `useMatch() may be used only in the context of a <Router> component.`
  );

  let { pathname } = useLocation();
  return PreactHooks.useMemo(
    () => matchPath<ParamKey, Path>(pattern, pathname),
    [pathname, pattern]
  );
}

/**
 * The interface for the navigate() function returned from useNavigate().
 */
export interface NavigateFunction {
  (to: To, options?: NavigateOptions): void;
  (delta: number): void;
}

/**
 * When processing relative navigation we want to ignore ancestor routes that
 * do not contribute to the path, such that index/pathless layout routes don't
 * interfere.
 *
 * For example, when moving a route element into an index route and/or a
 * pathless layout route, relative link behavior contained within should stay
 * the same.  Both of the following examples should link back to the root:
 *
 *   <Route path="/">
 *     <Route path="accounts" element={<Link to=".."}>
 *   </Route>
 *
 *   <Route path="/">
 *     <Route path="accounts">
 *       <Route element={<AccountsLayout />}>       // <-- Does not contribute
 *         <Route index element={<Link to=".."} />  // <-- Does not contribute
 *       </Route
 *     </Route>
 *   </Route>
 */
function getPathContributingMatches(matches: RouteMatch[]) {
  return matches.filter(
    (match, index) =>
      index === 0 ||
      (!match.route.index &&
        match.pathnameBase !== matches[index - 1].pathnameBase)
  );
}

/**
 * Returns an imperative method for changing the location. Used by <Link>s, but
 * may also be used by other elements to change the location.
 *
 * @see https://reactrouter.com/docs/en/v6/hooks/use-navigate
 */
export function useNavigate(): NavigateFunction {
  invariant(
    useInRouterContext(),
    // TODO: This error is probably because they somehow have 2 versions of the
    // router loaded. We can help them understand how to avoid that.
    `useNavigate() may be used only in the context of a <Router> component.`
  );

  let { basename, navigator } = PreactHooks.useContext(NavigationContext);
  let { matches } = PreactHooks.useContext(RouteContext);
  let { pathname: locationPathname } = useLocation();

  let routePathnamesJson = JSON.stringify(
    getPathContributingMatches(matches).map((match) => match.pathnameBase)
  );

  let activeRef = PreactHooks.useRef(false);
  PreactHooks.useEffect(() => {
    activeRef.current = true;
  });

  let navigate: NavigateFunction = PreactHooks.useCallback(
    (to: To | number, options: NavigateOptions = {}) => {
      warning(
        activeRef.current,
        `You should call navigate() in a React.useEffect(), not when ` +
          `your component is first rendered.`
      );

      if (!activeRef.current) return;

      if (typeof to === "number") {
        navigator.go(to);
        return;
      }

      let path = resolveTo(
        to,
        JSON.parse(routePathnamesJson),
        locationPathname,
        options.relative === "path"
      );

      // If we're operating within a basename, prepend it to the pathname prior
      // to handing off to history.  If this is a root navigation, then we
      // navigate to the raw basename which allows the basename to have full
      // control over the presence of a trailing slash on root links
      if (basename !== "/") {
        path.pathname =
          path.pathname === "/"
            ? basename
            : joinPaths([basename, path.pathname]);
      }

      (options.replace ? navigator.replace : navigator.push)(
        path,
        options.state,
        options
      );
    },
    [basename, navigator, routePathnamesJson, locationPathname]
  );

  return navigate;
}

const OutletContext = Preact.createContext<unknown>(null) as any;

/**
 * Returns the context (if provided) for the child route at this level of the route
 * hierarchy.
 * @see https://reactrouter.com/docs/en/v6/hooks/use-outlet-context
 */
export function useOutletContext<Context = unknown>(): Context {
  return PreactHooks.useContext(OutletContext) as Context;
}

/**
 * Returns the element for the child route at this level of the route
 * hierarchy. Used internally by <Outlet> to render child routes.
 *
 * @see https://reactrouter.com/docs/en/v6/hooks/use-outlet
 */
export function useOutlet(context?: unknown) {
  let outlet = PreactHooks.useContext(RouteContext).outlet;
  if (outlet) {
    return (
      <OutletContext.Provider value={context}>{outlet}</OutletContext.Provider>
    );
  }
  return outlet;
}

/**
 * Returns an object of key/value pairs of the dynamic params from the current
 * URL that were matched by the route path.
 *
 * @see https://reactrouter.com/docs/en/v6/hooks/use-params
 */
export function useParams<
  ParamsOrKey extends string | Record<string, string | undefined> = string
>(): Readonly<
  [ParamsOrKey] extends [string] ? Params<ParamsOrKey> : Partial<ParamsOrKey>
> {
  let { matches } = PreactHooks.useContext(RouteContext);
  let routeMatch = matches[matches.length - 1];
  return routeMatch ? (routeMatch.params as any) : {};
}

/**
 * Resolves the pathname of the given `to` value against the current location.
 *
 * @see https://reactrouter.com/docs/en/v6/hooks/use-resolved-path
 */
export function useResolvedPath(
  to: To,
  { relative }: { relative?: RelativeRoutingType } = {}
): Path {
  let { matches } = PreactHooks.useContext(RouteContext);
  let { pathname: locationPathname } = useLocation();

  let routePathnamesJson = JSON.stringify(
    getPathContributingMatches(matches).map((match) => match.pathnameBase)
  );

  return PreactHooks.useMemo(
    () =>
      resolveTo(
        to,
        JSON.parse(routePathnamesJson),
        locationPathname,
        relative === "path"
      ),
    [to, routePathnamesJson, locationPathname, relative]
  );
}

/**
 * Returns the element of the route that matched the current location, prepared
 * with the correct context to render the remainder of the route tree. Route
 * elements in the tree must render an <Outlet> to render their child route's
 * element.
 *
 * @see https://reactrouter.com/docs/en/v6/hooks/use-routes
 */
export function useRoutes(
  routes: RouteObject[],
  locationArg?: Partial<Location> | string
): Preact.JSX.Element | null {
  invariant(
    useInRouterContext(),
    // TODO: This error is probably because they somehow have 2 versions of the
    // router loaded. We can help them understand how to avoid that.
    `useRoutes() may be used only in the context of a <Router> component.`
  );

  let dataRouterStateContext = PreactHooks.useContext(DataRouterStateContext);
  let { matches: parentMatches } = PreactHooks.useContext(RouteContext);
  let routeMatch = parentMatches[parentMatches.length - 1];
  let parentParams = routeMatch ? routeMatch.params : {};
  let parentPathnameBase = routeMatch ? routeMatch.pathnameBase : "/";

  let locationFromContext = useLocation();

  let location;
  if (locationArg) {
    let parsedLocationArg =
      typeof locationArg === "string" ? parsePath(locationArg) : locationArg;

    invariant(
      parentPathnameBase === "/" ||
        parsedLocationArg.pathname?.startsWith(parentPathnameBase),
      `When overriding the location using \`<Routes location>\` or \`useRoutes(routes, location)\`, ` +
        `the location pathname must begin with the portion of the URL pathname that was ` +
        `matched by all parent routes. The current pathname base is "${parentPathnameBase}" ` +
        `but pathname "${parsedLocationArg.pathname}" was given in the \`location\` prop.`
    );

    location = parsedLocationArg;
  } else {
    location = locationFromContext;
  }

  let pathname = location.pathname || "/";
  let remainingPathname =
    parentPathnameBase === "/"
      ? pathname
      : pathname.slice(parentPathnameBase.length) || "/";

  let matches = matchRoutes(routes, { pathname: remainingPathname });

  return _renderMatches(
    matches &&
      matches.map((match) =>
        Object.assign({}, match, {
          params: Object.assign({}, parentParams, match.params),
          pathname: joinPaths([parentPathnameBase, match.pathname]),
          pathnameBase:
            match.pathnameBase === "/"
              ? parentPathnameBase
              : joinPaths([parentPathnameBase, match.pathnameBase]),
        })
      ),
    parentMatches,
    dataRouterStateContext || undefined
  );
}

function DefaultErrorElement() {
  let error = useRouteError();
  let message = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : error instanceof Error
    ? error.message
    : JSON.stringify(error);
  let stack = error instanceof Error ? error.stack : null;
  let lightgrey = "rgba(200,200,200, 0.5)";
  let preStyles = { padding: "0.5rem", backgroundColor: lightgrey };
  let codeStyles = { padding: "2px 4px", backgroundColor: lightgrey };
  return (
    <>
      <h2>Unhandled Thrown Error!</h2>
      <h3 style={{ fontStyle: "italic" }}>{message}</h3>
      {stack ? <pre style={preStyles}>{stack}</pre> : null}
      <p>💿 Hey developer 👋</p>
      <p>
        You can provide a way better UX than this when your app throws errors by
        providing your own&nbsp;
        <code style={codeStyles}>errorElement</code> props on&nbsp;
        <code style={codeStyles}>&lt;Route&gt;</code>
      </p>
    </>
  );
}

type RenderErrorBoundaryProps = {
  location: Location;
  error: any;
  component: any;
  children?: Preact.ComponentChildren;
};

type RenderErrorBoundaryState = {
  location: Location;
  error: any;
};

export class RenderErrorBoundary extends Preact.Component<
  RenderErrorBoundaryProps,
  RenderErrorBoundaryState
> {
  constructor(props: RenderErrorBoundaryProps) {
    super(props);
    this.state = {
      location: props.location,
      error: props.error,
    };
  }

  static getDerivedStateFromError(error: any) {
    return { error: error };
  }

  static getDerivedStateFromProps(
    props: RenderErrorBoundaryProps,
    state: RenderErrorBoundaryState
  ) {
    // When we get into an error state, the user will likely click "back" to the
    // previous page that didn't have an error. Because this wraps the entire
    // application, that will have no effect--the error page continues to display.
    // This gives us a mechanism to recover from the error when the location changes.
    //
    // Whether we're in an error state or not, we update the location in state
    // so that when we are in an error state, it gets reset when a new location
    // comes in and the user recovers from the error.
    if (state.location !== props.location) {
      return {
        error: props.error,
        location: props.location,
      };
    }

    // If we're not changing locations, preserve the location but still surface
    // any new errors that may come through. We retain the existing error, we do
    // this because the error provided from the app state may be cleared without
    // the location changing.
    return {
      error: props.error || state.error,
      location: state.location,
    };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error(
      "React Router caught the following error during render",
      error,
      errorInfo
    );
  }

  render() {
    return this.state.error ? (
      <RouteErrorContext.Provider
        value={this.state.error}
        children={this.props.component}
      />
    ) : (
      this.props.children
    );
  }
}

interface RenderedRouteProps {
  routeContext: RouteContextObject;
  match: RouteMatch<string, RouteObject>;
  children?: Preact.ComponentChildren;
}

function RenderedRoute({ routeContext, match, children }: RenderedRouteProps) {
  let dataStaticRouterContext = PreactHooks.useContext(DataStaticRouterContext);

  // Track how deep we got in our render pass to emulate SSR componentDidCatch
  // in a DataStaticRouter
  if (dataStaticRouterContext && match.route.errorElement) {
    dataStaticRouterContext._deepestRenderedBoundaryId = match.route.id;
  }

  const Provider = RouteContext.Provider as any;
  return <Provider value={routeContext}>{children}</Provider>;
}

export function _renderMatches(
  matches: RouteMatch[] | null,
  parentMatches: RouteMatch[] = [],
  dataRouterState?: RemixRouter["state"]
): Preact.JSX.Element | null {
  if (matches == null) {
    if (dataRouterState?.errors) {
      // Don't bail if we have data router errors so we can render them in the
      // boundary.  Use the pre-matched (or shimmed) matches
      matches = dataRouterState.matches as DataRouteMatch[];
    } else {
      return null;
    }
  }

  let renderedMatches = matches;

  // If we have data errors, trim matches to the highest error boundary
  let errors = dataRouterState?.errors;
  if (errors != null) {
    let errorIndex = renderedMatches.findIndex(
      (m) => m.route.id && errors?.[m.route.id]
    );
    invariant(
      errorIndex >= 0,
      `Could not find a matching route for the current errors: ${errors}`
    );
    renderedMatches = renderedMatches.slice(
      0,
      Math.min(renderedMatches.length, errorIndex + 1)
    );
  }

  return renderedMatches.reduceRight((outlet, match, index) => {
    let error = match.route.id ? errors?.[match.route.id] : null;
    // Only data routers handle errors
    let errorElement = dataRouterState
      ? match.route.errorElement || <DefaultErrorElement />
      : null;
    let getChildren = () => (
      <RenderedRoute
        match={match}
        routeContext={{
          outlet,
          matches: parentMatches.concat(renderedMatches.slice(0, index + 1)),
        }}
      >
        {error
          ? errorElement
          : match.route.element !== undefined
          ? match.route.element
          : outlet}
      </RenderedRoute>
    );
    // Only wrap in an error boundary within data router usages when we have an
    // errorElement on this route.  Otherwise let it bubble up to an ancestor
    // errorElement
    return dataRouterState && (match.route.errorElement || index === 0) ? (
      <RenderErrorBoundary
        location={dataRouterState.location}
        component={errorElement}
        error={error}
        children={getChildren()}
      />
    ) : (
      getChildren()
    );
  }, null as any | null);
}

enum DataRouterHook {
  UseLoaderData = "useLoaderData",
  UseActionData = "useActionData",
  UseRouteError = "useRouteError",
  UseNavigation = "useNavigation",
  UseRouteLoaderData = "useRouteLoaderData",
  UseMatches = "useMatches",
  UseRevalidator = "useRevalidator",
}

function useDataRouterState(hookName: DataRouterHook) {
  let state = PreactHooks.useContext(DataRouterStateContext);
  invariant(state, `${hookName} must be used within a DataRouterStateContext`);
  return state;
}

/**
 * Returns the current navigation, defaulting to an "idle" navigation when
 * no navigation is in progress
 */
export function useNavigation() {
  let state = useDataRouterState(DataRouterHook.UseNavigation);
  return state.navigation;
}

/**
 * Returns a revalidate function for manually triggering revalidation, as well
 * as the current state of any manual revalidations
 */
export function useRevalidator() {
  let dataRouterContext = PreactHooks.useContext(DataRouterContext);
  invariant(
    dataRouterContext,
    `useRevalidator must be used within a DataRouterContext`
  );
  let state = useDataRouterState(DataRouterHook.UseRevalidator);
  return {
    revalidate: dataRouterContext.router.revalidate,
    state: state.revalidation,
  };
}

/**
 * Returns the active route matches, useful for accessing loaderData for
 * parent/child routes or the route "handle" property
 */
export function useMatches() {
  let { matches, loaderData } = useDataRouterState(DataRouterHook.UseMatches);
  return PreactHooks.useMemo(
    () =>
      matches.map((match) => {
        let { pathname, params } = match;
        // Note: This structure matches that created by createUseMatchesMatch
        // in the @remix-run/router , so if you change this please also change
        // that :)  Eventually we'll DRY this up
        return {
          id: match.route.id,
          pathname,
          params,
          data: loaderData[match.route.id] as unknown,
          handle: match.route.handle as unknown,
        };
      }),
    [matches, loaderData]
  );
}

/**
 * Returns the loader data for the nearest ancestor Route loader
 */
export function useLoaderData(): unknown {
  let state = useDataRouterState(DataRouterHook.UseLoaderData);

  let route = PreactHooks.useContext(RouteContext);
  invariant(route, `useLoaderData must be used inside a RouteContext`);

  let thisRoute = route.matches[route.matches.length - 1];
  invariant(
    thisRoute.route.id,
    `useLoaderData can only be used on routes that contain a unique "id"`
  );

  return state.loaderData[thisRoute.route.id];
}

/**
 * Returns the loaderData for the given routeId
 */
export function useRouteLoaderData(routeId: string): unknown {
  let state = useDataRouterState(DataRouterHook.UseRouteLoaderData);
  return state.loaderData[routeId];
}

/**
 * Returns the action data for the nearest ancestor Route action
 */
export function useActionData(): unknown {
  let state = useDataRouterState(DataRouterHook.UseActionData);

  let route = PreactHooks.useContext(RouteContext);
  invariant(route, `useActionData must be used inside a RouteContext`);

  return Object.values(state?.actionData || {})[0];
}

/**
 * Returns the nearest ancestor Route error, which could be a loader/action
 * error or a render error.  This is intended to be called from your
 * errorElement to display a proper error message.
 */
export function useRouteError(): unknown {
  let error = PreactHooks.useContext(RouteErrorContext);
  let state = useDataRouterState(DataRouterHook.UseRouteError);
  let route = PreactHooks.useContext(RouteContext);
  let thisRoute = route.matches[route.matches.length - 1];

  // If this was a render error, we put it in a RouteError context inside
  // of RenderErrorBoundary
  if (error) {
    return error;
  }

  invariant(route, `useRouteError must be used inside a RouteContext`);
  invariant(
    thisRoute.route.id,
    `useRouteError can only be used on routes that contain a unique "id"`
  );

  // Otherwise look for errors from our data router state
  return state.errors?.[thisRoute.route.id];
}

/**
 * Returns the happy-path data from the nearest ancestor <Await /> value
 */
export function useAsyncValue(): unknown {
  let value = PreactHooks.useContext(AwaitContext);
  return value?._data;
}

/**
 * Returns the error from the nearest ancestor <Await /> value
 */
export function useAsyncError(): unknown {
  let value = PreactHooks.useContext(AwaitContext);
  return value?._error;
}

export interface RouterProviderProps {
  fallbackElement?: Preact.ComponentChild;
  router: RemixRouter;
}

/**
 * Given a Remix Router instance, render the appropriate UI
 */
export function RouterProvider({
  fallbackElement,
  router,
}: RouterProviderProps) {
  // Sync router state to our component state to force re-renders
  let state: RouterState = useSyncExternalStoreShim(
    router.subscribe,
    () => router.state,
    // We have to provide this so React@18 doesn't complain during hydration,
    // but we pass our serialized hydration data into the router so state here
    // is already synced with what the server saw
    () => router.state
  );

  let navigator = PreactHooks.useMemo((): Navigator => {
    return {
      createHref: router.createHref,
      go: (n) => router.navigate(n),
      push: (to, state, opts) =>
        router.navigate(to, {
          state,
          preventScrollReset: opts?.preventScrollReset,
        }),
      replace: (to, state, opts) =>
        router.navigate(to, {
          replace: true,
          state,
          preventScrollReset: opts?.preventScrollReset,
        }),
    };
  }, [router]);

  let basename = router.basename || "/";

  return (
    <DataRouterContext.Provider
      value={{
        router,
        navigator,
        static: false,
        // Do we need this?
        basename,
      }}
    >
      <DataRouterStateContext.Provider value={state}>
        <Router
          basename={router.basename}
          location={router.state.location}
          navigationType={router.state.historyAction}
          navigator={navigator}
        >
          {router.state.initialized ? <Routes /> : fallbackElement}
        </Router>
      </DataRouterStateContext.Provider>
    </DataRouterContext.Provider>
  );
}

export interface NavigateProps {
  to: To;
  replace?: boolean;
  state?: any;
  relative?: RelativeRoutingType;
}

/**
 * Changes the current location.
 *
 * Note: This API is mostly useful in React.Component subclasses that are not
 * able to use hooks. In functional components, we recommend you use the
 * `useNavigate` hook instead.
 *
 * @see https://reactrouter.com/docs/en/v6/components/navigate
 */
export function Navigate({
  to,
  replace,
  state,
  relative,
}: NavigateProps): null {
  invariant(
    useInRouterContext(),
    // TODO: This error is probably because they somehow have 2 versions of
    // the router loaded. We can help them understand how to avoid that.
    `<Navigate> may be used only in the context of a <Router> component.`
  );

  warning(
    !PreactHooks.useContext(NavigationContext).static,
    `<Navigate> must not be used on the initial render in a <StaticRouter>. ` +
      `This is a no-op, but you should modify your code so the <Navigate> is ` +
      `only ever rendered in response to some user interaction or state change.`
  );

  let dataRouterState = PreactHooks.useContext(DataRouterStateContext);
  let navigate = useNavigate();

  PreactHooks.useEffect(() => {
    // Avoid kicking off multiple navigations if we're in the middle of a
    // data-router navigation, since components get re-rendered when we enter
    // a submitting/loading state
    if (dataRouterState && dataRouterState.navigation.state !== "idle") {
      return;
    }
    navigate(to, { replace, state, relative });
  });

  return null;
}

export interface OutletProps {
  context?: unknown;
}

/**
 * Renders the child route's element, if there is one.
 *
 * @see https://reactrouter.com/docs/en/v6/components/outlet
 */
export function Outlet(props: OutletProps) {
  return useOutlet(props.context);
}

interface DataRouteProps {
  id?: RouteObject["id"];
  loader?: RouteObject["loader"];
  action?: RouteObject["action"];
  errorElement?: RouteObject["errorElement"];
  shouldRevalidate?: RouteObject["shouldRevalidate"];
  handle?: RouteObject["handle"];
}

export interface RouteProps extends DataRouteProps {
  caseSensitive?: boolean;
  children?: Preact.ComponentChildren;
  element?: Preact.ComponentChild | null;
  index?: boolean;
  path?: string;
}

export interface PathRouteProps extends DataRouteProps {
  caseSensitive?: boolean;
  children?: Preact.ComponentChildren;
  element?: Preact.ComponentChild | null;
  index?: false;
  path: string;
}

export interface LayoutRouteProps extends DataRouteProps {
  children?: Preact.ComponentChildren;
  element?: Preact.ComponentChild | null;
}

export interface IndexRouteProps extends DataRouteProps {
  element?: Preact.ComponentChildren | null;
  index: true;
}

/**
 * Declares an element that should be rendered at a certain URL path.
 *
 * @see https://reactrouter.com/docs/en/v6/components/route
 */
export function Route(
  _props: PathRouteProps | LayoutRouteProps | IndexRouteProps
): any | null {
  invariant(
    false,
    `A <Route> is only ever to be used as the child of <Routes> element, ` +
      `never rendered directly. Please wrap your <Route> in a <Routes>.`
  );
}

export interface RouterProps {
  basename?: string;
  children?: Preact.ComponentChildren;
  location: Partial<Location> | string;
  navigationType?: NavigationType;
  navigator: Navigator;
  static?: boolean;
}

/**
 * Provides location context for the rest of the app.
 *
 * Note: You usually won't render a <Router> directly. Instead, you'll render a
 * router that is more specific to your environment such as a <BrowserRouter>
 * in web browsers or a <StaticRouter> for server rendering.
 *
 * @see https://reactrouter.com/docs/en/v6/routers/router
 */
function Router({
  basename: basenameProp = "/",
  children = null,
  location: locationProp,
  navigationType = NavigationType.Pop,
  navigator,
  static: staticProp = false,
}: RouterProps) {
  invariant(
    !useInRouterContext(),
    `You cannot render a <Router> inside another <Router>.` +
      ` You should never have more than one in your app.`
  );

  // Preserve trailing slashes on basename, so we can let the user control
  // the enforcement of trailing slashes throughout the app
  let basename = basenameProp.replace(/^\/*/, "/");
  let navigationContext = PreactHooks.useMemo(
    () => ({ basename, navigator, static: staticProp }),
    [basename, navigator, staticProp]
  );

  if (typeof locationProp === "string") {
    locationProp = parsePath(locationProp);
  }

  let {
    pathname = "/",
    search = "",
    hash = "",
    state = null,
    key = "default",
  } = locationProp;

  let location = PreactHooks.useMemo(() => {
    let trailingPathname = stripBasename(pathname, basename);

    if (trailingPathname == null) {
      return null;
    }

    return {
      pathname: trailingPathname,
      search,
      hash,
      state,
      key,
    };
  }, [basename, pathname, search, hash, state, key]);

  warning(
    location != null,
    `<Router basename="${basename}"> is not able to match the URL ` +
      `"${pathname}${search}${hash}" because it does not start with the ` +
      `basename, so the <Router> won't render anything.`
  );

  if (location == null) {
    return null;
  }

  return (
    <NavigationContext.Provider value={navigationContext}>
      <LocationContext.Provider
        children={children}
        value={{ location, navigationType }}
      />
    </NavigationContext.Provider>
  );
}

export interface RoutesProps {
  children?: Preact.ComponentChildren;
  location?: Partial<Location> | string;
}

/**
 * A container for a nested tree of <Route> elements that renders the branch
 * that best matches the current location.
 *
 * @see https://reactrouter.com/docs/en/v6/components/routes
 */
function Routes({ children, location }: RoutesProps) {
  let dataRouterContext = PreactHooks.useContext(DataRouterContext);
  // When in a DataRouterContext _without_ children, we use the router routes
  // directly.  If we have children, then we're in a descendant tree and we
  // need to use child routes.
  let routes =
    dataRouterContext && !children
      ? (dataRouterContext.router.routes as DataRouteObject[])
      : createRoutesFromChildren(children);
  return useRoutes(routes, location);
}

export interface AwaitResolveRenderFunction {
  (data: Awaited<any>): any;
}

export interface AwaitProps {
  children: Preact.ComponentChildren | AwaitResolveRenderFunction;
  errorElement?: Preact.ComponentChild;
  resolve: TrackedPromise | any;
}

/**
 * Component to use for rendering lazily loaded data from returning defer()
 * in a loader function
 */
export function Await({ children, errorElement, resolve }: AwaitProps) {
  return (
    <AwaitErrorBoundary resolve={resolve} errorElement={errorElement}>
      <ResolveAwait>{children}</ResolveAwait>
    </AwaitErrorBoundary>
  );
}

type AwaitErrorBoundaryProps = {
  errorElement?: Preact.ComponentChild;
  resolve: TrackedPromise | any;
  children?: Preact.ComponentChildren;
};

type AwaitErrorBoundaryState = {
  error: any;
};

enum AwaitRenderStatus {
  pending,
  success,
  error,
}

const neverSettledPromise = new Promise(() => {});

class AwaitErrorBoundary extends Preact.Component<
  AwaitErrorBoundaryProps,
  AwaitErrorBoundaryState
> {
  constructor(props: AwaitErrorBoundaryProps) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error(
      "<Await> caught the following error during render",
      error,
      errorInfo
    );
  }

  render() {
    let { children, errorElement, resolve } = this.props;

    let promise: TrackedPromise | null = null;
    let status: AwaitRenderStatus = AwaitRenderStatus.pending;

    if (!(resolve instanceof Promise)) {
      // Didn't get a promise - provide as a resolved promise
      status = AwaitRenderStatus.success;
      promise = Promise.resolve();
      Object.defineProperty(promise, "_tracked", { get: () => true });
      Object.defineProperty(promise, "_data", { get: () => resolve });
    } else if (this.state.error) {
      // Caught a render error, provide it as a rejected promise
      status = AwaitRenderStatus.error;
      let renderError = this.state.error;
      promise = Promise.reject().catch(() => {}); // Avoid unhandled rejection warnings
      Object.defineProperty(promise, "_tracked", { get: () => true });
      Object.defineProperty(promise, "_error", { get: () => renderError });
    } else if ((resolve as TrackedPromise)._tracked) {
      // Already tracked promise - check contents
      promise = resolve;
      status =
        promise._error !== undefined
          ? AwaitRenderStatus.error
          : promise._data !== undefined
          ? AwaitRenderStatus.success
          : AwaitRenderStatus.pending;
    } else {
      // Raw (untracked) promise - track it
      status = AwaitRenderStatus.pending;
      Object.defineProperty(resolve, "_tracked", { get: () => true });
      promise = resolve.then(
        (data: any) =>
          Object.defineProperty(resolve, "_data", { get: () => data }),
        (error: any) =>
          Object.defineProperty(resolve, "_error", { get: () => error })
      );
    }

    if (
      status === AwaitRenderStatus.error &&
      promise._error instanceof AbortedDeferredError
    ) {
      // Freeze the UI by throwing a never resolved promise
      throw neverSettledPromise;
    }

    if (status === AwaitRenderStatus.error && !errorElement) {
      // No errorElement, throw to the nearest route-level error boundary
      throw promise._error;
    }

    if (status === AwaitRenderStatus.error) {
      // Render via our errorElement
      return <AwaitContext.Provider value={promise} children={errorElement} />;
    }

    if (status === AwaitRenderStatus.success) {
      // Render children with resolved value
      return <AwaitContext.Provider value={promise} children={children} />;
    }

    // Throw to the suspense boundary
    throw promise;
  }
}

/**
 * @private
 * Indirection to leverage useAsyncValue for a render-prop API on <Await>
 */
function ResolveAwait({
  children,
}: {
  children: Preact.ComponentChildren | AwaitResolveRenderFunction;
}) {
  let data = useAsyncValue();
  if (typeof children === "function") {
    return children(data);
  }
  return <>{children}</>;
}

///////////////////////////////////////////////////////////////////////////////
// UTILS
///////////////////////////////////////////////////////////////////////////////

/**
 * Creates a route config from a React "children" object, which is usually
 * either a `<Route>` element or an array of them. Used internally by
 * `<Routes>` to create a route config from its children.
 *
 * @see https://reactrouter.com/docs/en/v6/utils/create-routes-from-children
 */
export function createRoutesFromChildren(
  children: Preact.ComponentChildren,
  parentPath: number[] = []
): RouteObject[] {
  let routes: RouteObject[] = [];

  const c = Array.isArray(children) ? children : children ? [children] : [];

  // TODO: What's going on with the type here?  Only fails on build but IDE
  // doesn't complain
  // @ts-expect-error
  c.forEach((element: Preact.VNode<any>, index) => {
    if (!Preact.isValidElement(element)) {
      // Ignore non-elements. This allows people to more easily inline
      // conditionals in their route config.
      return;
    }

    if (element.type === Preact.Fragment) {
      // Transparently support React.Fragment and its children.
      routes.push.apply(
        routes,
        createRoutesFromChildren(element.props.children, parentPath)
      );
      return;
    }

    invariant(
      element.type === Route,
      `[${
        typeof element.type === "string" ? element.type : element.type.name
      }] is not a <Route> component. All component children of <Routes> must be a <Route> or <React.Fragment>`
    );

    let treePath = [...parentPath, index];
    let route: RouteObject = {
      id: element.props.id || treePath.join("-"),
      caseSensitive: element.props.caseSensitive,
      element: element.props.element,
      index: element.props.index,
      path: element.props.path,
      loader: element.props.loader,
      action: element.props.action,
      errorElement: element.props.errorElement,
      hasErrorBoundary: element.props.errorElement != null,
      shouldRevalidate: element.props.shouldRevalidate,
      handle: element.props.handle,
    };

    if (element.props.children) {
      route.children = createRoutesFromChildren(
        element.props.children,
        treePath
      );
    }

    routes.push(route);
  });

  return routes;
}

export { createRoutesFromChildren as createRoutesFromElements };

/**
 * Renders the result of `matchRoutes()` into a React element.
 */
export function renderMatches(matches: RouteMatch[] | null) {
  return _renderMatches(matches);
}

/**
 * @private
 * Walk the route tree and add hasErrorBoundary if it's not provided, so that
 * users providing manual route arrays can just specify errorElement
 */
export function enhanceManualRouteObjects(
  routes: RouteObject[]
): RouteObject[] {
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
}

declare global {
  var __staticRouterHydrationData: HydrationState | undefined;
}

////////////////////////////////////////////////////////////////////////////////
//#region Components
////////////////////////////////////////////////////////////////////////////////

type t = Preact.Attributes;
export interface LinkProps
  extends Omit<Preact.JSX.HTMLAttributes<HTMLAnchorElement>, "href"> {
  reloadDocument?: boolean;
  replace?: boolean;
  state?: any;
  preventScrollReset?: boolean;
  relative?: RelativeRoutingType;
  to: To;
}

/**
 * The public API for rendering a history-aware <a>.
 */
export const Link = forwardRef<HTMLAnchorElement, LinkProps>(
  function LinkWithRef(
    {
      onClick,
      relative,
      reloadDocument,
      replace,
      state,
      target,
      to,
      preventScrollReset,
      ...rest
    },
    ref
  ) {
    let href = useHref(to, { relative });
    let internalOnClick = useLinkClickHandler(to, {
      replace,
      state,
      target,
      preventScrollReset,
      relative,
    });
    function handleClick(event: MouseEvent) {
      // TODO: I don't think this is correct
      if (onClick) (onClick as any)(event);
      if (!event.defaultPrevented) {
        internalOnClick(event);
      }
    }

    return (
      <a
        {...rest}
        href={href}
        onClick={reloadDocument ? onClick : handleClick}
        ref={ref}
        target={target}
      />
    );
  }
);

export interface NavLinkProps
  extends Omit<LinkProps, "className" | "style" | "children"> {
  children?:
    | Preact.ComponentChildren
    | ((props: { isActive: boolean; isPending: boolean }) => any);
  caseSensitive?: boolean;
  className?:
    | string
    | ((props: {
        isActive: boolean;
        isPending: boolean;
      }) => string | undefined);
  end?: boolean;
  style?:
    | Preact.JSX.CSSProperties
    | ((props: {
        isActive: boolean;
        isPending: boolean;
      }) => Preact.JSX.CSSProperties | undefined);
}

/**
 * A <Link> wrapper that knows if it's "active" or not.
 */
export const NavLink = forwardRef<HTMLAnchorElement, NavLinkProps>(
  function NavLinkWithRef(
    {
      "aria-current": ariaCurrentProp = "page",
      caseSensitive = false,
      className: classNameProp = "",
      end = false,
      style: styleProp,
      to,
      children,
      ...rest
    }: any,
    ref
  ) {
    let path = useResolvedPath(to);
    let match = useMatch({ path: path.pathname, end, caseSensitive });

    let routerState = PreactHooks.useContext(DataRouterStateContext);
    let nextLocation = routerState?.navigation.location;
    let nextPath = useResolvedPath(nextLocation || "");
    let nextMatch = PreactHooks.useMemo(
      () =>
        nextLocation
          ? matchPath(
              { path: path.pathname, end, caseSensitive },
              nextPath.pathname
            )
          : null,
      [nextLocation, path.pathname, caseSensitive, end, nextPath.pathname]
    );

    let isPending = nextMatch != null;
    let isActive = match != null;

    let ariaCurrent = isActive ? ariaCurrentProp : undefined;

    let className: string | undefined;
    if (typeof classNameProp === "function") {
      className = classNameProp({ isActive, isPending });
    } else {
      // If the className prop is not a function, we use a default `active`
      // class for <NavLink />s that are active. In v5 `active` was the default
      // value for `activeClassName`, but we are removing that API and can still
      // use the old default behavior for a cleaner upgrade path and keep the
      // simple styling rules working as they currently do.
      className = [
        classNameProp,
        isActive ? "active" : null,
        isPending ? "pending" : null,
      ]
        .filter(Boolean)
        .join(" ");
    }

    let style =
      typeof styleProp === "function"
        ? styleProp({ isActive, isPending })
        : styleProp;

    return (
      <Link
        {...rest}
        aria-current={ariaCurrent}
        className={className}
        ref={ref}
        style={style}
        to={to}
      >
        {typeof children === "function"
          ? children({ isActive, isPending })
          : children}
      </Link>
    );
  }
);

export interface FormProps extends Preact.JSX.HTMLAttributes<HTMLFormElement> {
  /**
   * The HTTP verb to use when the form is submit. Supports "get", "post",
   * "put", "delete", "patch".
   */
  method?: FormMethod;

  /**
   * Normal `<form action>` but supports React Router's relative paths.
   */
  action?: string;

  /**
   * Forces a full document navigation instead of a fetch.
   */
  reloadDocument?: boolean;

  /**
   * Replaces the current entry in the browser history stack when the form
   * navigates. Use this if you don't want the user to be able to click "back"
   * to the page with the form on it.
   */
  replace?: boolean;

  /**
   * Determines whether the form action is relative to the route hierarchy or
   * the pathname.  Use this if you want to opt out of navigating the route
   * hierarchy and want to instead route based on /-delimited URL segments
   */
  relative?: RelativeRoutingType;

  /**
   * A function to call when the form is submitted. If you call
   * `event.preventDefault()` then this form will not do anything.
   */
  onSubmit?: Preact.JSX.HTMLAttributes<HTMLFormElement>["onSubmit"];
}

/**
 * A `@remix-run/router`-aware `<form>`. It behaves like a normal form except
 * that the interaction with the server is with `fetch` instead of new document
 * requests, allowing components to add nicer UX to the page as the form is
 * submitted and returns with data.
 */
export const Form = forwardRef<HTMLFormElement, FormProps>((props, ref) => {
  return <FormImpl {...props} ref={ref} />;
});

type HTMLFormSubmitter = HTMLButtonElement | HTMLInputElement;

interface FormImplProps extends FormProps {
  fetcherKey?: string;
  routeId?: string;
}

const FormImpl = forwardRef<HTMLFormElement, FormImplProps>(
  (
    {
      reloadDocument,
      replace,
      method = defaultMethod,
      action,
      onSubmit,
      fetcherKey,
      routeId,
      relative,
      ...props
    },
    forwardedRef
  ) => {
    let submit = useSubmitImpl(fetcherKey, routeId);
    let formMethod: FormMethod =
      method.toLowerCase() === "get" ? "get" : "post";
    let formAction = useFormAction(action, { relative });
    let submitHandler: Preact.JSX.HTMLAttributes<HTMLFormElement>["onSubmit"] =
      (event) => {
        // @ts-expect-error
        onSubmit?.(event);
        if (event.defaultPrevented) return;
        event.preventDefault();

        // TODO: I don't think this is correct
        let submitter = (event as unknown as any).nativeEvent
          .submitter as HTMLFormSubmitter | null;

        submit(submitter || event.currentTarget, { method, replace, relative });
      };

    return (
      <form
        ref={forwardedRef}
        method={formMethod}
        action={formAction}
        onSubmit={reloadDocument ? onSubmit : submitHandler}
        {...props}
      />
    );
  }
);

interface ScrollRestorationProps {
  getKey?: GetScrollRestorationKeyFunction;
  storageKey?: string;
}

/**
 * This component will emulate the browser's scroll restoration on location
 * changes.
 */
export function ScrollRestoration({
  getKey,
  storageKey,
}: ScrollRestorationProps) {
  useScrollRestoration({ getKey, storageKey });
  return null;
}

//#endregion

////////////////////////////////////////////////////////////////////////////////
//#region Hooks
////////////////////////////////////////////////////////////////////////////////

/**
 * Handles the click behavior for router `<Link>` components. This is useful if
 * you need to create custom `<Link>` components with the same click behavior we
 * use in our exported `<Link>`.
 */
export function useLinkClickHandler<E extends Element = HTMLAnchorElement>(
  to: To,
  {
    target,
    replace: replaceProp,
    state,
    preventScrollReset,
    relative,
  }: {
    target?: "_self" | "_blank" | "_parent" | "_top" | (string & {});
    replace?: boolean;
    state?: any;
    preventScrollReset?: boolean;
    relative?: RelativeRoutingType;
  } = {}
): (event: MouseEvent) => void {
  let navigate = useNavigate();
  let location = useLocation();
  let path = useResolvedPath(to, { relative });

  return PreactHooks.useCallback(
    (event: MouseEvent) => {
      if (shouldProcessLinkClick(event, target)) {
        event.preventDefault();

        // If the URL hasn't changed, a regular <a> will do a replace instead of
        // a push, so do the same here unless the replace prop is explicitly set
        let replace =
          replaceProp !== undefined
            ? replaceProp
            : createPath(location) === createPath(path);

        navigate(to, { replace, state, preventScrollReset, relative });
      }
    },
    [
      location,
      navigate,
      path,
      replaceProp,
      state,
      target,
      to,
      preventScrollReset,
      relative,
    ]
  );
}

/**
 * A convenient wrapper for reading and writing search parameters via the
 * URLSearchParams interface.
 */
export function useSearchParams(
  defaultInit?: URLSearchParamsInit
): [URLSearchParams, SetURLSearchParams] {
  warning(
    typeof URLSearchParams !== "undefined",
    `You cannot use the \`useSearchParams\` hook in a browser that does not ` +
      `support the URLSearchParams API. If you need to support Internet ` +
      `Explorer 11, we recommend you load a polyfill such as ` +
      `https://github.com/ungap/url-search-params\n\n` +
      `If you're unsure how to load polyfills, we recommend you check out ` +
      `https://polyfill.io/v3/ which provides some recommendations about how ` +
      `to load polyfills only for users that need them, instead of for every ` +
      `user.`
  );

  let defaultSearchParamsRef = PreactHooks.useRef(
    createSearchParams(defaultInit)
  );

  let location = useLocation();
  let searchParams = PreactHooks.useMemo(
    () =>
      getSearchParamsForLocation(
        location.search,
        defaultSearchParamsRef.current
      ),
    [location.search]
  );

  let navigate = useNavigate();
  let setSearchParams = PreactHooks.useCallback<SetURLSearchParams>(
    (nextInit, navigateOptions) => {
      const newSearchParams = createSearchParams(
        typeof nextInit === "function" ? nextInit(searchParams) : nextInit
      );
      navigate("?" + newSearchParams, navigateOptions);
    },
    [navigate, searchParams]
  );

  return [searchParams, setSearchParams];
}

type SetURLSearchParams = (
  nextInit?:
    | URLSearchParamsInit
    | ((prev: URLSearchParams) => URLSearchParamsInit),
  navigateOpts?: NavigateOptions
) => void;

type SubmitTarget =
  | HTMLFormElement
  | HTMLButtonElement
  | HTMLInputElement
  | FormData
  | URLSearchParams
  | { [name: string]: string }
  | null;

/**
 * Submits a HTML `<form>` to the server without reloading the page.
 */
export interface SubmitFunction {
  (
    /**
     * Specifies the `<form>` to be submitted to the server, a specific
     * `<button>` or `<input type="submit">` to use to submit the form, or some
     * arbitrary data to submit.
     *
     * Note: When using a `<button>` its `name` and `value` will also be
     * included in the form data that is submitted.
     */
    target: SubmitTarget,

    /**
     * Options that override the `<form>`'s own attributes. Required when
     * submitting arbitrary data without a backing `<form>`.
     */
    options?: SubmitOptions
  ): void;
}

/**
 * Returns a function that may be used to programmatically submit a form (or
 * some arbitrary data) to the server.
 */
export function useSubmit(): SubmitFunction {
  return useSubmitImpl();
}

function useSubmitImpl(fetcherKey?: string, routeId?: string): SubmitFunction {
  let dataRouterContext = PreactHooks.useContext(DataRouterContext);
  invariant(
    dataRouterContext,
    "useSubmitImpl must be used within a Data Router"
  );
  let { router } = dataRouterContext;
  let defaultAction = useFormAction();

  return PreactHooks.useCallback(
    (target, options = {}) => {
      if (typeof document === "undefined") {
        throw new Error(
          "You are calling submit during the server render. " +
            "Try calling submit within a `useEffect` or callback instead."
        );
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
        invariant(routeId != null, "No routeId available for useFetcher()");
        router.fetch(fetcherKey, routeId, href, opts);
      } else {
        router.navigate(href, opts);
      }
    },
    [defaultAction, router, fetcherKey, routeId]
  );
}

export function useFormAction(
  action?: string,
  { relative }: { relative?: RelativeRoutingType } = {}
): string {
  let routeContext = PreactHooks.useContext(RouteContext);
  invariant(routeContext, "useFormAction must be used inside a RouteContext");

  let [match] = routeContext.matches.slice(-1);
  let resolvedAction = action ?? ".";
  let path = useResolvedPath(resolvedAction, { relative });

  // Previously we set the default action to ".". The problem with this is that
  // `useResolvedPath(".")` excludes search params and the hash of the resolved
  // URL. This is the intended behavior of when "." is specifically provided as
  // the form action, but inconsistent w/ browsers when the action is omitted.
  // https://github.com/remix-run/remix/issues/927
  let location = useLocation();
  if (action == null) {
    // Safe to write to these directly here since if action was undefined, we
    // would have called useResolvedPath(".") which will never include a search
    // or hash
    path.search = location.search;
    path.hash = location.hash;

    // When grabbing search params from the URL, remove the automatically
    // inserted ?index param so we match the useResolvedPath search behavior
    // which would not include ?index
    if (match.route.index) {
      let params = new URLSearchParams(path.search);
      params.delete("index");
      path.search = params.toString() ? `?${params.toString()}` : "";
    }
  }

  if ((!action || action === ".") && match.route.index) {
    path.search = path.search
      ? path.search.replace(/^\?/, "?index&")
      : "?index";
  }

  return createPath(path);
}

function createFetcherForm(fetcherKey: string, routeId: string) {
  let FetcherForm = forwardRef<HTMLFormElement, FormProps>((props, ref) => {
    return (
      <FormImpl
        {...props}
        ref={ref}
        fetcherKey={fetcherKey}
        routeId={routeId}
      />
    );
  });
  return FetcherForm;
}

let fetcherId = 0;

export type FetcherWithComponents<TData> = Fetcher<TData> & {
  Form: ReturnType<typeof createFetcherForm>;
  submit: (
    target: SubmitTarget,
    // Fetchers cannot replace because they are not navigation events
    options?: Omit<SubmitOptions, "replace">
  ) => void;
  load: (href: string) => void;
};

/**
 * Interacts with route loaders and actions without causing a navigation. Great
 * for any interaction that stays on the same page.
 */
export function useFetcher<TData = any>(): FetcherWithComponents<TData> {
  let dataRouterContext = PreactHooks.useContext(DataRouterContext);
  invariant(dataRouterContext, `useFetcher must be used within a Data Router`);
  let { router } = dataRouterContext;

  let route = PreactHooks.useContext(RouteContext);
  invariant(route, `useFetcher must be used inside a RouteContext`);

  let routeId = route.matches[route.matches.length - 1]?.route.id;
  invariant(
    routeId != null,
    `useFetcher can only be used on routes that contain a unique "id"`
  );

  let [fetcherKey] = PreactHooks.useState(() => String(++fetcherId));
  let [Form] = PreactHooks.useState(() => {
    invariant(routeId, `No routeId available for fetcher.Form()`);
    return createFetcherForm(fetcherKey, routeId);
  });
  let [load] = PreactHooks.useState(() => (href: string) => {
    invariant(router, "No router available for fetcher.load()");
    invariant(routeId, "No routeId available for fetcher.load()");
    router.fetch(fetcherKey, routeId, href);
  });
  let submit = useSubmitImpl(fetcherKey, routeId);

  let fetcher = router.getFetcher<TData>(fetcherKey);

  let fetcherWithComponents = PreactHooks.useMemo(
    () => ({
      Form,
      submit,
      load,
      ...fetcher,
    }),
    [fetcher, Form, submit, load]
  );

  PreactHooks.useEffect(() => {
    // Is this busted when the React team gets real weird and calls effects
    // twice on mount?  We really just need to garbage collect here when this
    // fetcher is no longer around.
    return () => {
      if (!router) {
        console.warn(`No fetcher available to clean up from useFetcher()`);
        return;
      }
      router.deleteFetcher(fetcherKey);
    };
  }, [router, fetcherKey]);

  return fetcherWithComponents;
}

/**
 * Provides all fetchers currently on the page. Useful for layouts and parent
 * routes that need to provide pending/optimistic UI regarding the fetch.
 */
export function useFetchers(): Fetcher[] {
  let state = PreactHooks.useContext(DataRouterStateContext);
  invariant(state, `useFetchers must be used within a DataRouterStateContext`);
  return [...state.fetchers.values()];
}

const SCROLL_RESTORATION_STORAGE_KEY = "react-router-scroll-positions";
let savedScrollPositions: Record<string, number> = {};

/**
 * When rendered inside a DataRouter, will restore scroll positions on navigations
 */
function useScrollRestoration({
  getKey,
  storageKey,
}: {
  getKey?: GetScrollRestorationKeyFunction;
  storageKey?: string;
} = {}) {
  let location = useLocation();
  let matches = useMatches();
  let navigation = useNavigation();
  let dataRouterContext = PreactHooks.useContext(DataRouterContext);
  invariant(
    dataRouterContext,
    "useScrollRestoration must be used within a DataRouterContext"
  );
  let { router } = dataRouterContext;
  let state = PreactHooks.useContext(DataRouterStateContext);

  invariant(
    router != null && state != null,
    "useScrollRestoration must be used within a DataRouterStateContext"
  );
  let { restoreScrollPosition, preventScrollReset } = state;

  // Trigger manual scroll restoration while we're active
  PreactHooks.useEffect(() => {
    window.history.scrollRestoration = "manual";
    return () => {
      window.history.scrollRestoration = "auto";
    };
  }, []);

  // Save positions on unload
  useBeforeUnload(
    PreactHooks.useCallback(() => {
      if (navigation.state === "idle") {
        let key = (getKey ? getKey(location, matches) : null) || location.key;
        savedScrollPositions[key] = window.scrollY;
      }
      sessionStorage.setItem(
        storageKey || SCROLL_RESTORATION_STORAGE_KEY,
        JSON.stringify(savedScrollPositions)
      );
      window.history.scrollRestoration = "auto";
    }, [storageKey, getKey, navigation.state, location, matches])
  );

  // Read in any saved scroll locations
  PreactHooks.useLayoutEffect(() => {
    try {
      let sessionPositions = sessionStorage.getItem(
        storageKey || SCROLL_RESTORATION_STORAGE_KEY
      );
      if (sessionPositions) {
        savedScrollPositions = JSON.parse(sessionPositions);
      }
    } catch (e) {
      // no-op, use default empty object
    }
  }, [storageKey]);

  // Enable scroll restoration in the router
  PreactHooks.useLayoutEffect(() => {
    let disableScrollRestoration = router?.enableScrollRestoration(
      savedScrollPositions,
      () => window.scrollY,
      getKey
    );
    return () => disableScrollRestoration && disableScrollRestoration();
  }, [router, getKey]);

  // Restore scrolling when state.restoreScrollPosition changes
  PreactHooks.useLayoutEffect(() => {
    // Explicit false means don't do anything (used for submissions)
    if (restoreScrollPosition === false) {
      return;
    }

    // been here before, scroll to it
    if (typeof restoreScrollPosition === "number") {
      window.scrollTo(0, restoreScrollPosition);
      return;
    }

    // try to scroll to the hash
    if (location.hash) {
      let el = document.getElementById(location.hash.slice(1));
      if (el) {
        el.scrollIntoView();
        return;
      }
    }

    // Opt out of scroll reset if this link requested it
    if (preventScrollReset === true) {
      return;
    }

    // otherwise go to the top on new locations
    window.scrollTo(0, 0);
  }, [location, restoreScrollPosition, preventScrollReset]);
}

function useBeforeUnload(callback: () => any): void {
  PreactHooks.useEffect(() => {
    window.addEventListener("beforeunload", callback);
    return () => {
      window.removeEventListener("beforeunload", callback);
    };
  }, [callback]);
}

//#endregion
