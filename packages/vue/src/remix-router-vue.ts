import {
  Component,
  computed,
  defineComponent,
  onUnmounted,
  Ref,
  ShallowRef,
  shallowRef,
  VNode,
  watch,
} from "vue";
import { h, inject, provide } from "vue";
import {
  FormMethod,
  Location,
  Router,
  DataRouteMatch,
  RouterState,
  RouteObject,
  Navigation,
  Fetcher,
  resolveTo,
  FormEncType,
} from "@remix-run/router";
import { createBrowserRouter, invariant } from "@remix-run/router";
import {
  getFormSubmissionInfo,
  shouldProcessLinkClick,
  SubmitOptions,
} from "./dom";

////////////////////////////////////////////////////////////////////////////////
//#region Types/Globals/Utils

// Re-exports from remix router
export { json, redirect, isRouteErrorResponse } from "@remix-run/router";

// Global context holding the singleton router and the current state
export interface RouterContext {
  router: Router;
  stateRef: ShallowRef<RouterState>;
}

// Wrapper context holding the route location in the current hierarchy
export interface RouteContext {
  id: string;
  index: boolean;
}
//#endregion

////////////////////////////////////////////////////////////////////////////////
//#region Composition API

// TODO: Change "any" types to "unknown" in @remix-run/router?

let RouterContextSymbol = Symbol();
let RouteContextSymbol = Symbol();

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

export function useNavigate(): Router["navigate"] {
  let ctx = getRouterContext();
  return ctx.router.navigate;
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
  let ctx = getRouterContext();
  let routeId = getRouteContext().id;
  return computed(() => ctx.stateRef.value.loaderData[routeId] as unknown);
}

export function useActionData(): Ref<unknown> {
  let ctx = getRouterContext();
  let routeId = getRouteContext().id;
  return computed(() => ctx.stateRef.value.actionData?.[routeId] as unknown);
}

export function useFormAction(action = "."): string {
  let { router } = getRouterContext();
  let route = getRouteContext();
  let location = useLocation();

  let path = resolveTo(
    action,
    router.state.matches.map((match) => match.pathnameBase),
    location.value.pathname
  );

  let search = path.search;
  if (action === "." && route.index) {
    search = search ? search.replace(/^\?/, "?index&") : "?index";
  }

  return path.pathname + search;
}

let fetcherId = 0;

type FetcherWithComponents<TData> = Fetcher<TData> & {
  Form: Component;
  // TODO: abstract via useSubmitImpl
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
        h(FormImpl, { ...props, fetcherKey }, slots.default),
  });

  return computed(() => ({
    ...fetcherRef.value,
    Form,
    submit(target, options = {}) {
      return submitForm(router, defaultAction, target, options, fetcherKey);
    },
    load(href) {
      return router.fetch(fetcherKey, href);
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

export const DataBrowserRouter = defineComponent({
  name: "DataBrowserRouter",
  props: {
    routes: {
      type: Array,
      required: true,
    },
    fallbackElement: {
      type: [Object, Function],
      required: true,
    },
  },
  setup(props) {
    let routes = props.routes as RouteObject[];
    let router = createBrowserRouter({ routes }).initialize();
    let stateRef = shallowRef<RouterState>(router.state);
    router.subscribe((state) => (stateRef.value = state));

    provide<RouterContext>(RouterContextSymbol, { router, stateRef });

    return () => {
      let state = stateRef.value;
      if (!state.initialized) {
        return h(props.fallbackElement as Component) || h("span");
      }

      return renderRouteWrapper(state.matches[0], state.location?.key);
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
    provide<RouteContext>(RouteContextSymbol, {
      id: props.id,
      index: props.index === true,
    });
    return () => slots.default?.();
  },
});

export const Outlet = defineComponent({
  name: "Outlet",
  setup() {
    let { stateRef, router } = getRouterContext();
    let { id } = getRouteContext();
    return () => {
      let { matches } = router.state;
      let idx = matches.findIndex((m) => m.route.id === id);
      if (idx < 0) {
        throw new Error(`Unable to find <Outlet /> match for route id: ${id}`);
      }
      if (!matches[idx + 1]) {
        // We found an <Outlet /> but do not have deeper matching paths so we
        // end the render tree here
        return null;
      }
      return renderRouteWrapper(matches[idx + 1], stateRef.value.location.key);
    };
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
            submitForm(
              router,
              defaultAction,
              (event.submitter as HTMLFormSubmitter) || event.currentTarget,
              {
                method: attrs.method as FormMethod,
                replace: props.replace,
              },
              props.fetcherKey
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
  setup:
    (props, { slots }) =>
    () =>
      h(FormImpl, { ...props }, slots.default),
});
//#endregion

////////////////////////////////////////////////////////////////////////////////
//#region Utils

function renderRouteWrapper(match: DataRouteMatch, locationKey: string): VNode {
  return h(
    RouteWrapper,
    {
      id: match.route.id,
      index: match.route.index === true,
      key: `${match.route.id}:${locationKey}`,
    },
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    () => h(match.route.element)
  );
}

function submitForm(
  router: Router,
  defaultAction: string,
  target:
    | HTMLFormElement
    | HTMLButtonElement
    | HTMLInputElement
    | FormData
    | URLSearchParams
    | { [name: string]: string }
    | null,
  options: SubmitOptions = {},
  fetcherKey?: string
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
    router.fetch(fetcherKey, href, opts);
  } else {
    router.navigate(href, opts);
  }
}
