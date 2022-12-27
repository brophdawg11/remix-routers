import {
  AbortedDeferredError,
  Action as NavigationType,
  createBrowserHistory,
  createHashHistory,
  createMemoryHistory,
  createRouter,
  invariant,
  isRouteErrorResponse,
  resolveTo,
  type AgnosticRouteMatch,
  type AgnosticRouteObject,
  type Fetcher,
  type FormEncType,
  type FormMethod,
  type HydrationState,
  type Location,
  type Navigation,
  type Path,
  type Router,
  type RouterState,
  type To,
} from "@remix-run/router";
import {
  computed,
  defineComponent,
  h,
  inject,
  onErrorCaptured,
  onUnmounted,
  provide,
  ref,
  shallowRef,
  watch,
  type Component,
  type PropType,
  type Ref,
  type ShallowRef,
  type VNode,
} from "vue";
import type { SubmitOptions } from "./dom";
import { getFormSubmissionInfo, shouldProcessLinkClick } from "./dom";

////////////////////////////////////////////////////////////////////////////////
//#region Types/Globals/Utils

// Re-exports from remix router
export { defer, isRouteErrorResponse, json, redirect } from "@remix-run/router";

// Create vue-specific types from the agnostic types in @remix-run/router to
// export from remix-router-vue
export interface RouteObject extends AgnosticRouteObject {
  children?: RouteObject[];
  element?: Component | null;
  errorElement?: Component | null;
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

// Global context holding the singleton router and the current state
export interface RouterContext {
  router: Router;
  stateRef: ShallowRef<RouterState>;
}

// Wrapper context holding the route location in the current hierarchy
export interface RouteContext {
  id: string;
  matches: DataRouteMatch[];
  index: boolean;
}

// Wrapper context holding the captured render error
export interface RouteErrorContext {
  error: unknown;
}
//#endregion

////////////////////////////////////////////////////////////////////////////////
//#region Routers

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

////////////////////////////////////////////////////////////////////////////////
//#region Composition API

// TODO: Change "any" types to "unknown" in @remix-run/router?

let RouterContextSymbol = Symbol();
let RouteContextSymbol = Symbol();
let RouteErrorSymbol = Symbol();

function getRouterContext(): RouterContext {
  let ctx = inject<RouterContext>(RouterContextSymbol);
  invariant(ctx != null, "No RouterContext available");
  return ctx;
}

function getRouteContext(): RouteContext {
  let ctx = inject<RouteContext>(RouteContextSymbol);
  invariant(ctx != null, "No RouteContext available");
  return ctx;
}

export function useNavigationType(): Ref<NavigationType> {
  let ctx = getRouterContext();
  return computed(() => ctx.stateRef.value.historyAction);
}

export function useLocation(): Ref<Location> {
  let ctx = getRouterContext();
  return computed(() => ctx.stateRef.value.location);
}

export function useMatches() {
  let ctx = getRouterContext();
  return computed(() =>
    ctx.stateRef.value.matches.map((match) => ({
      id: match.route.id,
      pathname: match.pathname,
      params: match.params,
      data: ctx.stateRef.value.loaderData[match.route.id] as unknown,
      handle: match.route.handle as unknown,
    }))
  );
}

export function useNavigation(): Ref<Navigation> {
  let ctx = getRouterContext();
  return computed(() => ctx.stateRef.value.navigation);
}

export function useLoaderData(): Ref<unknown> {
  return useRouteLoaderData(getRouteContext().id);
}

export function useRouteLoaderData(routeId: string): Ref<unknown> {
  let ctx = getRouterContext();
  return computed(() => ctx.stateRef.value.loaderData[routeId] as unknown);
}

export function useActionData(): Ref<unknown> {
  let ctx = getRouterContext();
  let routeId = getRouteContext().id;
  return computed(() => ctx.stateRef.value.actionData?.[routeId] as unknown);
}

export function useRouteError(): Ref<unknown> {
  let ctx = getRouterContext();
  let routeId = getRouteContext().id;
  let errorCtx = inject<RouteErrorContext>(RouteErrorSymbol);

  // If this was a render error, we put it in a RouteError context inside
  // of RenderErrorBoundary.  Otherwise look for errors from our data router
  // state
  return computed(
    () => (errorCtx?.error || ctx.router.state.errors?.[routeId]) as unknown
  );
}

export function useResolvedPath(to: To): Ref<Path> {
  let { matches } = getRouteContext();
  let location = useLocation();

  return computed(() =>
    resolveTo(
      to,
      getPathContributingMatches(matches).map((match) => match.pathnameBase),
      location.value.pathname
    )
  );
}

export function useHref(to: To): Ref<string> {
  let { router } = getRouterContext();
  let path = useResolvedPath(to);

  return computed(() =>
    router.createHref(createURL(router, createPath(path.value)))
  );
}

export interface NavigateOptions {
  replace?: boolean;
  state?: unknown;
}

/**
 * The interface for the navigate() function returned from useNavigate().
 */
export interface NavigateFunction {
  (to: To, options?: NavigateOptions): void;
  (delta: number): void;
}

export function useNavigate(): NavigateFunction {
  let { router } = getRouterContext();
  let { matches } = getRouteContext();
  let location = useLocation();

  let navigate: NavigateFunction = (
    to: To | number,
    options: NavigateOptions = {}
  ) => {
    if (typeof to === "number") {
      router.navigate(to);
      return;
    }

    let path = resolveTo(
      to,
      getPathContributingMatches(matches).map((match) => match.pathnameBase),
      location.value.pathname
    );

    router.navigate(path, {
      replace: options.replace,
      state: options.state,
    });
  };

  return navigate;
}

type SubmitTarget =
  | HTMLFormElement
  | HTMLButtonElement
  | HTMLInputElement
  | FormData
  | URLSearchParams
  | { [name: string]: string }
  | null;

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

export function useFormAction(action = "."): string {
  let { matches } = getRouteContext();
  let route = getRouteContext();
  let location = useLocation();

  let path = resolveTo(
    action,
    getPathContributingMatches(matches).map((match) => match.pathnameBase),
    location.value.pathname
  );

  let search = path.search;
  if (action === "." && route.index) {
    search = search ? search.replace(/^\?/, "?index&") : "?index";
  }

  return path.pathname + search;
}

export function useSubmit(): SubmitFunction {
  let { router } = getRouterContext();
  let defaultAction = useFormAction();

  let submit: SubmitFunction = (target, options = {}) => {
    submitImpl(router, defaultAction, target, options);
  };

  return submit;
}

let fetcherId = 0;

type FetcherWithComponents<TData> = Fetcher<TData> & {
  Form: Component;
  submit(
    target:
      | HTMLFormElement
      | HTMLButtonElement
      | HTMLInputElement
      | FormData
      | URLSearchParams
      | { [name: string]: string }
      | null,
    options?: SubmitOptions
  ): void;
  load: (href: string) => void;
};

export function useFetcher<TData = unknown>(): Ref<
  FetcherWithComponents<TData>
> {
  let { router, stateRef } = getRouterContext();
  let { id } = getRouteContext();
  let defaultAction = useFormAction();
  let fetcherKey = String(++fetcherId);
  let fetcherRef = shallowRef<Fetcher<TData>>(
    router.getFetcher<TData>(fetcherKey)
  );

  watch(
    stateRef,
    () => (fetcherRef.value = router.getFetcher<TData>(fetcherKey))
  );

  onUnmounted(() => router.deleteFetcher(fetcherKey));

  let Form = defineComponent({
    name: "fetcher.Form",
    props: {
      replace: {
        type: Boolean,
        default: false,
      },
      onSubmit: {
        type: Function,
        default: undefined,
      },
    },
    setup:
      (props, { slots }) =>
      () =>
        h(FormImpl, { ...props, fetcherKey, routeId: id }, slots.default),
  });

  return computed(() => ({
    ...fetcherRef.value,
    Form,
    submit(target, options = {}) {
      return submitImpl(router, defaultAction, target, options, fetcherKey, id);
    },
    load(href) {
      return router.fetch(fetcherKey, id, href);
    },
  }));
}

export function useFetchers(): Fetcher[] {
  let { stateRef } = getRouterContext();
  return [...stateRef.value.fetchers.values()];
}
//#endregion

////////////////////////////////////////////////////////////////////////////////
//#region Components

export const RouterProvider = defineComponent({
  name: "RouterProvider",
  props: {
    router: {
      type: Object as PropType<Router>,
      required: true,
    },
    fallbackElement: {
      type: Function as PropType<() => Component>,
    },
    hydrationData: {
      type: Object as PropType<HydrationState>,
    },
  },
  setup(props) {
    let { router, fallbackElement } = props;

    let stateRef = shallowRef<RouterState>(router.state);
    router.subscribe((state) => (stateRef.value = state));

    provide<RouterContext>(RouterContextSymbol, { router, stateRef });

    return () => {
      let state = stateRef.value;
      if (!state.initialized) {
        return fallbackElement ? h(fallbackElement) : h("span");
      }

      return h(OutletImpl, { root: true });
    };
  },
});

const RouteWrapper = defineComponent({
  name: "RouteWrapper",
  props: {
    id: {
      type: String,
      required: true,
    },
    index: {
      type: Boolean,
      required: true,
    },
  },
  setup(props, { slots }) {
    let { stateRef } = getRouterContext();
    provide<RouteContext>(RouteContextSymbol, {
      id: props.id,
      matches: stateRef.value.matches.slice(
        0,
        stateRef.value.matches.findIndex((m) => m.route.id === props.id) + 1
      ),
      index: props.index === true,
    });
    return () => slots.default?.();
  },
});

const ErrorWrapper = defineComponent({
  name: "ErrorWrapper",
  props: {
    error: {
      type: Object as PropType<unknown>,
      required: true,
    },
  },
  setup(props, { slots }) {
    provide<RouteErrorContext>(RouteErrorSymbol, {
      error: props.error,
    });
    return () => slots.default?.();
  },
});

const DefaultErrorElement = defineComponent({
  name: "DefaultErrorElement",
  setup() {
    let error = useRouteError();
    let message: string;
    let stack: string | undefined;
    if (isRouteErrorResponse(error.value)) {
      message = `${error.value.status} ${error.value.statusText}`;
    } else if (error.value instanceof Error) {
      message = error.value.message;
      stack = error.value.stack;
    } else {
      message = JSON.stringify(error.value);
    }
    let lightgrey = "rgba(200,200,200, 0.5)";
    let preStyles = { padding: "0.5rem", backgroundColor: lightgrey };
    let codeStyles = { padding: "2px 4px", backgroundColor: lightgrey };
    return () => [
      h("h2", "Unhandled Thrown Error!"),
      h("h3", { style: { fontStyle: "italic" } }, message),
      ...(stack ? [h("pre", { style: preStyles }, stack)] : []),
      h("p", "💿 Hey developer 👋"),
      h("p", [
        "You can provide a way better UX than this when your app throws errors by providing your own ",
        h("code", { style: codeStyles }, "errorElement"),
        "props on your routes.",
      ]),
    ];
  },
});

const ErrorBoundary = defineComponent({
  name: "ErrorBoundary",
  props: {
    component: {
      type: Object as PropType<Component>,
      required: true,
    },
    error: {
      type: Object as PropType<unknown>,
    },
  },
  setup(props, { slots }) {
    let errorRef = ref(props.error);

    onErrorCaptured((e) => {
      errorRef.value = e;
      return false; // don't bubble
    });

    return () => {
      return errorRef.value
        ? h(ErrorWrapper, { error: errorRef.value }, () => h(props.component))
        : slots.default?.();
    };
  },
});

const OutletImpl = defineComponent({
  name: "OutletImpl",
  props: {
    root: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    let { stateRef, router } = getRouterContext();
    let routeContext = props.root ? null : getRouteContext();
    return () => {
      let { matches } = router.state;
      let idx = matches.findIndex((m) => m.route.id === routeContext?.id);
      if (idx < 0 && !props.root) {
        throw new Error(
          `Unable to find <Outlet /> match for route id: ${
            routeContext?.id || "_root_"
          }`
        );
      }
      let matchToRender = matches[idx + 1];

      if (!matchToRender) {
        // We found an <Outlet /> but do not have deeper matching paths so we
        // end the render tree here
        return null;
      }

      // Grab the error if we've reached the correct boundary.  Type must remain
      // unknown since user's can throw anything from a loader/action.
      let error: unknown =
        router.state.errors?.[matchToRender.route.id] != null
          ? Object.values(router.state.errors)[0]
          : null;

      return renderRouteWrapper(
        matchToRender,
        stateRef.value.location,
        props.root,
        error
      );
    };
  },
});

export const Outlet = defineComponent({
  name: "Outlet",
  setup() {
    return () => h(OutletImpl);
  },
});

export const Link = defineComponent({
  name: "Link",
  props: {
    to: {
      type: String,
      required: true,
    },
  },
  setup(props, { slots, attrs }) {
    const { router } = getRouterContext();
    return () =>
      h(
        "a",
        {
          href: props.to,
          onClick(event: MouseEvent) {
            let target =
              typeof attrs.target === "string" ? attrs.target : undefined;
            if (!shouldProcessLinkClick(event, target)) {
              return;
            }
            event.preventDefault();
            router.navigate(props.to);
          },
        },
        slots.default?.()
      );
  },
});

type HTMLFormSubmitter = HTMLButtonElement | HTMLInputElement;

const FormImpl = defineComponent({
  name: "FormImpl",
  props: {
    replace: {
      type: Boolean,
      default: false,
    },
    onSubmit: {
      type: Function,
      default: undefined,
    },
    fetcherKey: {
      type: String,
      default: null,
    },
    routeId: {
      type: String,
      default: null,
    },
  },
  setup(props, { attrs, slots }) {
    let { router } = getRouterContext();
    let defaultAction = useFormAction(attrs.action as string);
    return () =>
      h(
        "form",
        {
          ...attrs,
          onSubmit(event: SubmitEvent) {
            props.onSubmit && props.onSubmit(event);
            if (event.defaultPrevented) {
              return;
            }
            event.preventDefault();
            submitImpl(
              router,
              defaultAction,
              (event.submitter as HTMLFormSubmitter) || event.currentTarget,
              {
                method: attrs.method as FormMethod,
                replace: props.replace,
              },
              props.fetcherKey,
              props.routeId
            );
          },
        },
        slots.default?.()
      );
  },
});

export const Form = defineComponent({
  name: "Form",
  props: {
    replace: {
      type: Boolean,
      default: false,
    },
    onSubmit: {
      type: Function,
      default: undefined,
    },
  },
  setup(props, { slots }) {
    return () => h(FormImpl, { ...props }, slots.default);
  },
});

export const Await = defineComponent({
  name: "Await",
  props: {
    resolve: {
      type: Promise as PropType<Promise<unknown>>,
      required: true,
    },
  },
  async setup(props, { slots }) {
    try {
      let promise: Promise<unknown> =
        props.resolve instanceof Promise
          ? props.resolve
          : Promise.resolve(props.resolve);
      let value = await promise;
      return () => slots.default?.(value);
    } catch (e) {
      if (e instanceof AbortedDeferredError) {
        // This deferred was aborted, await indefinitely to show the fallback
        // until either (1) we render the next route and this component is
        // unmounted, or (2) we get replaced with a new Promise for this route
        await new Promise(() => {
          // no-op
        });
      }
      if (slots.error) {
        return () => slots.error?.(e);
      } else {
        throw e;
      }
    }
  },
});
//#endregion

////////////////////////////////////////////////////////////////////////////////
//#region Utils

function enhanceManualRouteObjects(routes: RouteObject[]): RouteObject[] {
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

function renderRouteWrapper(
  match: DataRouteMatch,
  location: Location,
  root?: boolean,
  error?: unknown
): VNode {
  return h(
    RouteWrapper,
    {
      id: match.route.id,
      index: match.route.index === true,
      key: `${match.route.id}:${location.key}`,
    },
    () => {
      if (root || error || match.route.errorElement) {
        return h(
          ErrorBoundary,
          {
            component: match.route.errorElement || DefaultErrorElement,
            error,
          },
          () => h(match.route.element as Component)
        );
      }
      // Otherwise just render the element, letting render errors bubble upwards
      return h(match.route.element as Component);
    }
  );
}

function submitImpl(
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
  if (fetcherKey && routeId) {
    router.fetch(fetcherKey, routeId, href, opts);
  } else {
    router.navigate(href, opts);
  }
}

function getPathContributingMatches(matches: DataRouteMatch[]) {
  // Ignore index + pathless matches
  return matches.filter(
    (match, index) =>
      index === 0 ||
      (!match.route.index &&
        match.pathnameBase !== matches[index - 1].pathnameBase)
  );
}

function createPath({ pathname = "/", search = "", hash = "" }: Partial<Path>) {
  if (search && search !== "?")
    pathname += search.charAt(0) === "?" ? search : "?" + search;
  if (hash && hash !== "#")
    pathname += hash.charAt(0) === "#" ? hash : "#" + hash;
  return pathname;
}

function createURL(router: Router, location: Location | string): URL {
  let base =
    typeof window !== "undefined" && typeof window.location !== "undefined"
      ? window.location.origin
      : "unknown://unknown";
  let href =
    typeof location === "string" ? location : router.createHref(location);
  return new URL(href, base);
}
//#endregion
