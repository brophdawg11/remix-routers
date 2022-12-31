import {
  To,
  resolveTo,
  Path,
  Router,
  Location,
  FormMethod,
  FormEncType,
  Fetcher,
} from "@remix-run/router";
import {
  Accessor,
  Component,
  createSignal,
  mergeProps,
  onCleanup,
  useContext,
} from "solid-js";
import { RouteErrorContext } from "./components/Error";
import { FormImpl, FormProps } from "./components/Form";
import { useRoute, useRouter, useRouterState } from "./context";
import { getFormSubmissionInfo, SubmitOptions } from "./dom";
import { DataRouteMatch } from "./remix-router-solid";

export const useNavigationType = () => {
  const routerState = useRouterState();
  return () => routerState.historyAction;
};

export const useLocation = () => {
  const routerState = useRouterState();
  return () => routerState.location;
};

export const useMatches = () => {
  const routerState = useRouterState();
  return () =>
    routerState.matches.map((match) => ({
      id: match.route.id,
      pathname: match.pathname,
      params: match.params,
      data: routerState.loaderData[match.route.id] as unknown,
      handle: match.route.handle as unknown,
    }));
};

export const useNavigation = () => {
  const routerState = useRouterState();
  return () => routerState.navigation;
};

export const useRouteLoaderData = (routeId: Accessor<string>) => {
  const routerState = useRouterState();
  return () => routerState.loaderData[routeId()] as unknown;
};

export const useLoaderData = <Data>(): Accessor<Data> => {
  return useRouteLoaderData(useRoute().id) as Accessor<Data>;
};

export const useRouteError = () => {
  const routerState = useRouterState();
  const routeId = useRoute().id;
  const errorCtx = useContext(RouteErrorContext);

  return () => errorCtx?.error || (routerState.errors?.[routeId()] as unknown);
};

export const useActionData = () => {
  const routerState = useRouterState();
  const routerId = useRoute().id;

  return () => routerState.actionData?.[routerId()] as unknown;
};

export const useResolvedPath = (to: To) => {
  const matches = useRoute().matches;
  const location = useLocation();

  return () => {
    return resolveTo(
      to,
      getPathContributingMatches(matches).map((match) => match.pathnameBase),
      location().pathname
    );
  };
};

const getPathContributingMatches = (matches: DataRouteMatch[]) => {
  // Ignore index + pathless matches
  return matches.filter(
    (match, index) =>
      index === 0 ||
      (!match.route.index &&
        match.pathnameBase !== matches[index - 1].pathnameBase)
  );
};

const createPath = ({
  pathname = "/",
  search = "",
  hash = "",
}: Partial<Path>) => {
  if (search && search !== "?")
    pathname += search.charAt(0) === "?" ? search : "?" + search;
  if (hash && hash !== "#")
    pathname += hash.charAt(0) === "#" ? hash : "#" + hash;
  return pathname;
};

const createURL = (router: Router, location: Location | string): URL => {
  let base =
    typeof window !== "undefined" && typeof window.location !== "undefined"
      ? window.location.origin
      : "unknown://unknown";
  let href =
    typeof location === "string" ? location : router.createHref(location);
  return new URL(href, base);
};

export const useHref = (to: To) => {
  const router = useRouter();
  const path = useResolvedPath(to);

  return () => router.createHref(createURL(router, createPath(path())));
};

export interface NavigateOptions {
  replace?: boolean;
  state?: unknown;
}

export interface NavigateFunction {
  (to: To, option?: NavigateOptions): void;
  (delta: number): void;
}

export const useNavigate = () => {
  const router = useRouter();
  const route = useRoute();
  const location = useLocation();

  const navigate = (to: To | number, options: NavigateOptions = {}) => {
    if (typeof to === "number") {
      router.navigate(to);
      return;
    }

    const path = resolveTo(
      to,
      getPathContributingMatches(route.matches).map(
        (match) => match.pathnameBase
      ),
      location().pathname
    );

    router.navigate(path, { replace: options.replace, state: options.state });
  };

  return navigate;
};

type SubmitTarget =
  | HTMLFormElement
  | HTMLButtonElement
  | HTMLInputElement
  | FormData
  | URLSearchParams
  | { [name: string]: string }
  | null;

export interface SubmitFunction {
  (target: SubmitTarget, options?: SubmitOptions): void;
}

export const useFormAction = (action = ".") => {
  const router = useRoute();
  const location = useLocation();

  return () => {
    const path = resolveTo(
      action,
      getPathContributingMatches(router.matches).map(
        (match) => match.pathnameBase
      ),
      location().pathname
    );

    const search = path.search;

    // TODO: Deal with case when route is Index

    return path.pathname + search;
  };
};

export const useSubmit = (): SubmitFunction => {
  const router = useRouter();
  const defaultAction = useFormAction();

  const submit: SubmitFunction = (target, options = {}) => {
    submitImpl(router, defaultAction(), target, options);
  };

  return submit;
};

export const submitImpl = (
  router: Router,
  defaultAction: string,
  target: SubmitTarget,
  options: SubmitOptions = {},
  fetcherKey?: string,
  routeId?: string
): void => {
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
    console.log("Not here");
    router.navigate(href, opts);
  }
};

let fetcherId = 0;

type FetcherWithComponents<TData> = Fetcher<TData> & {
  Form: Component<FormProps>;
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

export const useFetcher = <
  TData = unknown
>(): (() => FetcherWithComponents<TData>) => {
  const router = useRouter();
  const route = useRoute();

  const defaultAction = useFormAction();
  const fetcherKey = `${++fetcherId}`;
  const [fetcher, setFetcher] = createSignal(router.getFetcher(fetcherKey));

  router.subscribe(() => {
    const newFetcher = router.getFetcher<TData>(fetcherKey);
    setFetcher(newFetcher);
  });

  onCleanup(() => {
    return router.deleteFetcher(fetcherKey);
  });

  const Form: Component<FormProps> = (props_) => {
    const props = mergeProps(
      {
        replace: false,
      },
      props_
    );

    return FormImpl({ ...props, fetcherKey, routeId: route.id() });
  };

  return () => ({
    ...fetcher(),
    Form,
    submit(target, options = {}) {
      return submitImpl(router, defaultAction(), target, options);
    },

    load(href) {
      return router.fetch(fetcherKey, route.id(), href);
    },
  });
};

export const useFetchers = () => {
  const routerState = useRouterState();
  return () => [...routerState.fetchers.values()];
};
