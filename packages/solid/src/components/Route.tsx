import { Accessor, Component, Show, splitProps } from "solid-js";
import { DataRouteMatch } from "src/remix-router-solid";
import { RouteContext, useRouterState } from "../context";
import { DefaultErrorElement, ErrorBoundary } from "./Error";

export interface RouterWrapperProps {
  id: Accessor<string>;
  children: Component;
  match: DataRouteMatch;
  root: boolean;
}

export const RouteWrapper = (props: RouterWrapperProps) => {
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
    <RouteContext.Provider value={routeContextValue}>
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
