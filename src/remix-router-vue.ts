import { computed, defineComponent, reactive, Ref, VNode } from "vue";
import { h, inject, provide, ref } from "vue";
import {
  FormEncType,
  FormMethod,
  Location,
  Router,
  DataRouteMatch,
  DataRouteObject,
  RouterState,
  RouteData,
  Transition,
  Fetcher,
  resolveTo,
  Path,
  To,
} from "@remix-run/router";
import { createBrowserRouter, invariant } from "@remix-run/router";

////////////////////////////////////////////////////////////////////////////////
//#region react-router-dom dom.ts
export const defaultMethod = "get";
export const defaultEncType = "application/x-www-form-urlencoded";

export function isHtmlElement(object: any): object is HTMLElement {
  return object != null && typeof object.tagName === "string";
}

export function isButtonElement(object: any): object is HTMLButtonElement {
  return isHtmlElement(object) && object.tagName.toLowerCase() === "button";
}

export function isFormElement(object: any): object is HTMLFormElement {
  return isHtmlElement(object) && object.tagName.toLowerCase() === "form";
}

export function isInputElement(object: any): object is HTMLInputElement {
  return isHtmlElement(object) && object.tagName.toLowerCase() === "input";
}

type LimitedMouseEvent = Pick<
  MouseEvent,
  "button" | "metaKey" | "altKey" | "ctrlKey" | "shiftKey"
>;

function isModifiedEvent(event: LimitedMouseEvent) {
  return !!(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey);
}

export function shouldProcessLinkClick(
  event: LimitedMouseEvent,
  target?: string
) {
  return (
    event.button === 0 && // Ignore everything but left clicks
    (!target || target === "_self") && // Let browser handle "target=_blank" etc.
    !isModifiedEvent(event) // Ignore clicks with modifier keys
  );
}

export type ParamKeyValuePair = [string, string];

export type URLSearchParamsInit =
  | string
  | ParamKeyValuePair[]
  | Record<string, string | string[]>
  | URLSearchParams;

/**
 * Creates a URLSearchParams object using the given initializer.
 *
 * This is identical to `new URLSearchParams(init)` except it also
 * supports arrays as values in the object form of the initializer
 * instead of just strings. This is convenient when you need multiple
 * values for a given key, but don't want to use an array initializer.
 *
 * For example, instead of:
 *
 *   let searchParams = new URLSearchParams([
 *     ['sort', 'name'],
 *     ['sort', 'price']
 *   ]);
 *
 * you can do:
 *
 *   let searchParams = createSearchParams({
 *     sort: ['name', 'price']
 *   });
 */
export function createSearchParams(
  init: URLSearchParamsInit = ""
): URLSearchParams {
  return new URLSearchParams(
    typeof init === "string" ||
    Array.isArray(init) ||
    init instanceof URLSearchParams
      ? init
      : Object.keys(init).reduce((memo, key) => {
          let value = init[key];
          return memo.concat(
            Array.isArray(value) ? value.map((v) => [key, v]) : [[key, value]]
          );
        }, [] as ParamKeyValuePair[])
  );
}

export function getSearchParamsForLocation(
  locationSearch: string,
  defaultSearchParams: URLSearchParams
) {
  let searchParams = createSearchParams(locationSearch);

  for (let key of defaultSearchParams.keys()) {
    if (!searchParams.has(key)) {
      defaultSearchParams.getAll(key).forEach((value) => {
        searchParams.append(key, value);
      });
    }
  }

  return searchParams;
}

export interface SubmitOptions {
  /**
   * The HTTP method used to submit the form. Overrides `<form method>`.
   * Defaults to "GET".
   */
  method?: FormMethod;

  /**
   * The action URL path used to submit the form. Overrides `<form action>`.
   * Defaults to the path of the current route.
   *
   * Note: It is assumed the path is already resolved. If you need to resolve a
   * relative path, use `useFormAction`.
   */
  action?: string;

  /**
   * The action URL used to submit the form. Overrides `<form encType>`.
   * Defaults to "application/x-www-form-urlencoded".
   */
  encType?: FormEncType;

  /**
   * Set `true` to replace the current entry in the browser's history stack
   * instead of creating a new one (i.e. stay on "the same page"). Defaults
   * to `false`.
   */
  replace?: boolean;
}

export function getFormSubmissionInfo(
  target:
    | HTMLFormElement
    | HTMLButtonElement
    | HTMLInputElement
    | FormData
    | URLSearchParams
    | { [name: string]: string }
    | null,
  defaultAction: string,
  options: SubmitOptions
): {
  url: URL;
  method: string;
  encType: string;
  formData: FormData;
} {
  let method: string;
  let action: string;
  let encType: string;
  let formData: FormData;

  if (isFormElement(target)) {
    let submissionTrigger: HTMLButtonElement | HTMLInputElement = (
      options as any
    ).submissionTrigger;

    method = options.method || target.getAttribute("method") || defaultMethod;
    action = options.action || target.getAttribute("action") || defaultAction;
    encType =
      options.encType || target.getAttribute("enctype") || defaultEncType;

    formData = new FormData(target);

    if (submissionTrigger && submissionTrigger.name) {
      formData.append(submissionTrigger.name, submissionTrigger.value);
    }
  } else if (
    isButtonElement(target) ||
    (isInputElement(target) &&
      (target.type === "submit" || target.type === "image"))
  ) {
    let form = target.form;

    if (form == null) {
      throw new Error(
        `Cannot submit a <button> or <input type="submit"> without a <form>`
      );
    }

    // <button>/<input type="submit"> may override attributes of <form>

    method =
      options.method ||
      target.getAttribute("formmethod") ||
      form.getAttribute("method") ||
      defaultMethod;
    action =
      options.action ||
      target.getAttribute("formaction") ||
      form.getAttribute("action") ||
      defaultAction;
    encType =
      options.encType ||
      target.getAttribute("formenctype") ||
      form.getAttribute("enctype") ||
      defaultEncType;

    formData = new FormData(form);

    // Include name + value from a <button>
    if (target.name) {
      formData.set(target.name, target.value);
    }
  } else if (isHtmlElement(target)) {
    throw new Error(
      `Cannot submit element that is not <form>, <button>, or ` +
        `<input type="submit|image">`
    );
  } else {
    method = options.method || defaultMethod;
    action = options.action || defaultAction;
    encType = options.encType || defaultEncType;

    if (target instanceof FormData) {
      formData = target;
    } else {
      formData = new FormData();

      if (target instanceof URLSearchParams) {
        for (let [name, value] of target) {
          formData.append(name, value);
        }
      } else if (target != null) {
        for (let name of Object.keys(target)) {
          formData.append(name, target[name]);
        }
      }
    }
  }

  let { protocol, host } = window.location;
  let url = new URL(action, `${protocol}//${host}`);

  if (method.toLowerCase() === "get") {
    for (let [name, value] of formData) {
      if (typeof value === "string") {
        url.searchParams.append(name, value);
      } else {
        throw new Error(`Cannot submit binary form data using GET`);
      }
    }
  }

  return { url, method, encType, formData };
}
//#endregion

export interface RemixRouterReactiveState {
  location: Location;
  transition: Transition;
  loaderData: RouteData;
}

export interface RouterContext {
  router: Router;
  reactiveState: RemixRouterReactiveState;
}

export interface RouteContext {
  id: string;
  index: boolean;
}

let RouterContextSymbol = Symbol();
let RouteContextSymbol = Symbol();

function useRouterContext(): RouterContext {
  let ctx = inject<RouterContext>(RouterContextSymbol);
  invariant(ctx != null, "No RouterContext available");
  return ctx;
}

function useRouteContext(): RouteContext {
  let ctx = inject<RouteContext>(RouteContextSymbol);
  invariant(ctx != null, "No RouteContext available");
  return ctx;
}

export function useNavigate(): Router["navigate"] {
  let ctx = useRouterContext();
  return ctx.router.navigate;
}

export function useLocation(): Ref<Location> {
  let ctx = useRouterContext();
  return computed(() => ctx.reactiveState.location);
}

export function useNavigation(): Ref<Transition> {
  let ctx = useRouterContext();
  return computed(() => ctx.reactiveState.transition);
}

export function useLoaderData(): Ref<any> {
  let ctx = useRouterContext();
  let routeId = useRouteContext().id;
  return computed(() => ctx.reactiveState.loaderData[routeId]);
}

export function useFormAction(
  action = ".",
  // TODO: Remove method param in v2 as it's no longer needed and is a breaking change
  method: FormMethod = "get"
): string {
  let { router } = useRouterContext();
  let route = useRouteContext();
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

// function createFetcherForm(fetcherKey: string) {
//   let FetcherForm = React.forwardRef<HTMLFormElement, FormProps>(
//     (props, ref) => {
//       return <FormImpl {...props} ref={ref} fetcherKey={fetcherKey} />;
//     }
//   );
//   return FetcherForm;
// }

// let fetcherId = 0;

// type FetcherWithComponents<TData> = Fetcher<TData> & {
//   Form: ReturnType<typeof createFetcherForm>;
//   submit: ReturnType<typeof useSubmitImpl>;
//   load: (href: string) => void;
// };

// export function useFetcher<TData = any>(): FetcherWithComponents<TData> {
//   let router = React.useContext(UNSAFE_DataRouterContext);
//   invariant(router, `useFetcher must be used within a DataRouter`);

//   let [fetcherKey] = React.useState(() => String(++fetcherId));
//   let [Form] = React.useState(() => createFetcherForm(fetcherKey));
//   let [load] = React.useState(() => (href: string) => {
//     invariant(router, `No router available for fetcher.load()`);
//     router.fetch(fetcherKey, href);
//   });
//   let submit = useSubmitImpl(fetcherKey);

//   let fetcher = router.getFetcher<TData>(fetcherKey);

//   let fetcherWithComponents = React.useMemo(
//     () => ({
//       Form,
//       submit,
//       load,
//       ...fetcher,
//     }),
//     [fetcher, Form, submit, load]
//   );

//   React.useEffect(() => {
//     // Is this busted when the React team gets real weird and calls effects
//     // twice on mount?  We really just need to garbage collect here when this
//     // fetcher is no longer around.
//     return () => {
//       if (!router) {
//         console.warn("No fetcher available to clean up from useFetcher()");
//         return;
//       }
//       router.deleteFetcher(fetcherKey);
//     };
//   }, [router, fetcherKey]);

//   return fetcherWithComponents;
// }

// /**
//  * Provides all fetchers currently on the page. Useful for layouts and parent
//  * routes that need to provide pending/optimistic UI regarding the fetch.
//  */
// export function useFetchers(): Fetcher[] {
//   let router = React.useContext(UNSAFE_DataRouterContext);
//   invariant(router, `useFetcher must be used within a DataRouter`);
//   return [...router.state.fetchers.values()];
// }

export const BrowserRouter = defineComponent({
  name: "BrowserRouter",
  props: {
    routes: {
      type: Array,
      required: true,
    },
  },
  setup(props) {
    let router = createBrowserRouter({
      routes: props.routes as DataRouteObject[],
    });

    // Create reactive object to trigger re-renders on state changes
    let { location, transition, loaderData } = router.state;
    let reactiveState: RemixRouterReactiveState = reactive({
      location,
      transition,
      loaderData,
    });

    // Update reactive state on router changes
    router.subscribe((state) =>
      Object.assign(reactiveState, {
        location: state.location,
        transition: state.transition,
        loaderData: state.loaderData,
      })
    );

    provide<RouterContext>(RouterContextSymbol, {
      router,
      reactiveState,
    });

    return () =>
      renderRouteWrapper(router.state.matches[0], reactiveState.location?.key);
  },
});

function renderRouteWrapper(match: DataRouteMatch, locationKey: string): VNode {
  return h(
    RouteWrapper,
    {
      id: match.route.id,
      index: match.route.index === true,
      key: `${match.route.id}:${locationKey}`,
    },
    () => h(match.route.element as ReturnType<typeof defineComponent>)
  );
}

export const RouteWrapper = defineComponent({
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
    let { reactiveState, router } = useRouterContext();
    let { id } = useRouteContext();
    return () => {
      let { matches } = router.state;
      let idx = matches.findIndex((m) => m.route.id === id);
      if (idx < 0) {
        console.error("No current match found for outlet");
        return null;
      }
      let match = matches[idx + 1];
      return match
        ? renderRouteWrapper(match, reactiveState.location.key)
        : null;
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
  setup(props, { slots }) {
    const { router } = useRouterContext();
    return () =>
      h(
        "a",
        {
          href: props.to,
          onClick(e: Event) {
            e.preventDefault();
            router.navigate(props.to);
          },
        },
        slots.default?.()
      );
  },
});

// TODO: Get from react router dom
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
    target:
      | HTMLFormElement
      | HTMLButtonElement
      | HTMLInputElement
      | FormData
      | URLSearchParams
      | { [name: string]: string }
      | null,

    /**
     * Options that override the `<form>`'s own attributes. Required when
     * submitting arbitrary data without a backing `<form>`.
     */
    options?: SubmitOptions
  ): void;
}

function useSubmitImpl(router: Router, fetcherKey?: string): SubmitFunction {
  let defaultAction = useFormAction();
  return (target, options = {}) => {
    invariant(
      router != null,
      "useSubmit() must be used within a <BrowserRouter>"
    );

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
  };
}

export const Form = defineComponent({
  name: "VuemixForm",
  setup(props, { attrs, slots }) {
    const { router } = useRouterContext();
    const submit = useSubmitImpl(router);
    const el = ref();
    const btnEl = ref();

    return () =>
      h(
        "form",
        {
          ref: el,
          ...attrs,
          onClick(e: MouseEvent) {
            let submitButton = (
              e?.target as HTMLButtonElement | HTMLInputElement
            )?.closest<HTMLButtonElement | HTMLInputElement>(
              "button,input[type=submit]"
            );
            if (
              submitButton &&
              submitButton?.form === el.value &&
              submitButton?.type === "submit"
            ) {
              btnEl.value = submitButton;
            }
          },
          onSubmit(e: SubmitEvent) {
            e.preventDefault();
            submit(btnEl.value || el.value);
            btnEl.value = null;
          },
        },
        slots.default?.()
      );
  },
});
