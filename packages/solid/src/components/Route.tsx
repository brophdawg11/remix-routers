import { Accessor, Component, Show, splitProps } from "solid-js";
import { DataRouteMatch } from "../remix-router-solid";
import { RouteContext, useRouterState } from "../context";
import { DefaultErrorElement, ErrorBoundary } from "./Error";

export interface RouteWrapperProps {
  id: Accessor<string>;
  children: Component;
  match: DataRouteMatch;
  root: boolean;
}

export const RouteWrapper = (props: RouteWrapperProps) => {
  const routerState = useRouterState();
  const [routeContextValue, otherProps] = splitProps(props, ["id"]);

  const error: Accessor<unknown> = () => {
    return routerState.errors?.[props.id()] != null
      ? Object.values(routerState.errors)[0]
      : null;
  };

  const shouldRenderErrorBoundary = () => {
    return props.root || error() || props.match.route.errorElement;
  };

  return (
    <RouteContext.Provider
      value={{
        ...routeContextValue,
        matches: routerState.matches.slice(
          0,
          routerState.matches.findIndex((m) => m.route.id === props.id()) + 1
        ),
      }}
    >
      <Show
        when={shouldRenderErrorBoundary()}
        fallback={otherProps.children({})}
      >
        <ErrorBoundary
          error={error}
          component={props.match.route.errorElement || DefaultErrorElement}
        >
          {otherProps.children}
        </ErrorBoundary>
      </Show>
    </RouteContext.Provider>
  );
};
