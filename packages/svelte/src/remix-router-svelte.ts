import {
  Action as NavigationType,
  resolveTo,
  type Fetcher,
  type FormEncType,
  type FormMethod,
  type Navigation,
  type Router,
  type Location,
} from "@remix-run/router";
import { onDestroy, SvelteComponent } from "svelte";
import { derived, writable, type Readable, type Writable } from "svelte/store";
import { getRouteContext, getRouterContext } from "./contexts";
import { getFormSubmissionInfo, type SubmitOptions } from "./dom";

type FetcherWithComponents<TData> = Fetcher<TData> & {
  Form: SvelteComponent;
  key: string;
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

// TODO fix reactivity. loaderData is set to undefined before component unmounts causing runtime error
export function useRouteLoaderData(routeId: string): Readable<unknown> {
  let ctx = getRouterContext();
  return derived(ctx.state, ({ loaderData }) => loaderData[routeId] as unknown);
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
  let { pathname } = getStoreSnapshot(location);

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
  let defaultAction = useFormAction();
  let fetcherKey = String(++fetcherId);
  let fetcherStore = writable<Fetcher<TData>>(
    router.getFetcher<TData>(fetcherKey)
  );
  let unsub = state.subscribe(() => {
    fetcherStore.set(router.getFetcher<TData>(fetcherKey));
  });

  onDestroy(() => {
    router.deleteFetcher(fetcherKey);
    unsub();
  });

  return derived(fetcherStore, (fetcher) => {
    return {
      ...fetcher,
      // how to get fetcherKey passed in?
      Form,
      key: fetcherKey,
      submit(target: SubmitTarget, options = {}) {
        return submitForm(router, defaultAction, target, options, fetcherKey);
      },
      load(href: string) {
        return router.fetch(fetcherKey, href);
      },
    };
  });
}

export { DataBrowserRouter } from "./components/DataBrowserRouter";
export { Outlet } from "./components/Outlet";
export { Link } from "./components/Link";
import { Form } from "./components/Form";
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

function getStoreSnapshot<T>(store: Readable<T> | Writable<T>): T {
  let snap;
  let unsub = store.subscribe((val) => (snap = val));
  unsub();
  return snap;
}
