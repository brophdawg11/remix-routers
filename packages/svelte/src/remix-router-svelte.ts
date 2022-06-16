import {
  Action as NavigationType,
  resolveTo,
  type Fetcher,
  type FormEncType,
  type FormMethod,
  type Navigation,
  type Router,
  type Location,
  type DataRouteMatch,
  type RouteData,
} from "@remix-run/router";
import { onDestroy, SvelteComponent } from "svelte";
import { writable } from "svelte/store";
import { getRouteContext, getRouterContext } from "./contexts";
import { getFormSubmissionInfo, type SubmitOptions } from "./dom";

type FetcherWithComponents<TData> = Fetcher<TData> & {
  Form: SvelteComponent;
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

export function useLocation(): Location {
  let ctx = getRouterContext();
  let data: Location;
  ctx.state.subscribe((state) => {
    data = state.location;
  });
  return data;
}

export function useNavigation(): Navigation {
  let ctx = getRouterContext();
  let data: Navigation;
  ctx.state.subscribe((state) => {
    data = state.navigation;
  });
  return data;
}

export function useNavigate(): Router["navigate"] {
  let ctx = getRouterContext();
  return ctx.router.navigate;
}

export function useNavigationType(): NavigationType {
  let ctx = getRouterContext();
  let data: NavigationType;
  ctx.state.subscribe((val) => {
    data = val.historyAction;
  });
  return data;
}

export function useMatches() {
  let ctx = getRouterContext();
  let matches: DataRouteMatch[];
  let loaderData: RouteData;
  ctx.state.subscribe((val) => {
    matches = val.matches;
    loaderData = val.loaderData;
  });
  return matches.map((match) => ({
    id: match.route.id,
    pathname: match.pathname,
    params: match.params,
    data: loaderData[match.route.id] as unknown,
    handle: match.route.handle as unknown,
  }));
}

export function useFormAction(action = "."): string {
  let { router } = getRouterContext();
  let route = getRouteContext();
  let location = useLocation();

  let path = resolveTo(
    action,
    router.state.matches.map((match) => match.pathnameBase),
    location.pathname
  );

  let search = path.search;
  if (action === "." && route.index) {
    search = search ? search.replace(/^\?/, "?index&") : "?index";
  }

  return path.pathname + search;
}

let fetcherId = 0;
export function useFetcher<TData = unknown>(): FetcherWithComponents<TData> {
  let { router, state } = getRouterContext();
  let defaultAction = useFormAction();
  let fetcherKey = String(++fetcherId);
  let fetcherStore = writable<Fetcher<TData>>(
    router.getFetcher<TData>(fetcherKey)
  );

  let fetcherRef: Fetcher<TData>;
  fetcherStore.subscribe((val) => {
    fetcherRef = val;
  });
  state.subscribe(() => {
    fetcherStore.set(router.getFetcher<TData>(fetcherKey));
  });

  onDestroy(() => {
    router.deleteFetcher(fetcherKey);
  });
  // {
  //   name: "fetcher.Form",
  //   props: {
  //     replace: {
  //       type: Boolean,
  //       default: false,
  //     },
  //     onSubmit: {
  //       type: Function,
  //       default: undefined,
  //     },
  //   },
  //   setup:
  //     (props, { slots }) =>
  //     () =>
  //       h(FormImpl, { ...props, fetcherKey }, slots.default),
  // }

  return {
    ...fetcherRef,
    Form,
    submit(target, options = {}) {
      return submitForm(router, defaultAction, target, options, fetcherKey);
    },
    load(href) {
      return router.fetch(fetcherKey, href);
    },
  };
}

export { DataBrowserRouter } from "./components/DataBrowserRouter";
export { Outlet } from "./components/Outlet";
export { Link } from "./components/Link";
import { Form } from "./components/Form";
export { Form };
export { shouldProcessLinkClick } from "./dom";
export {
  getRouteContext,
  getRouterContext,
  RouteContextSymbol,
  RouterContextSymbol,
} from "./contexts";

export { json, redirect, isRouteErrorResponse } from "@remix-run/router";

export function submitForm(
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
