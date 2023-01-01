import {
  Accessor,
  Component,
  createSignal,
  JSX,
  onError,
  Show,
} from "solid-js";
import { useRouteError } from "../hooks";
import { isRouteErrorResponse } from "@remix-run/router";
import { RouteErrorContext } from "src/context";


export interface ErrorBoundaryProps {
  component: Component;
  error: Accessor<unknown>;
  children: Component;
}

export const ErrorBoundary = (props: ErrorBoundaryProps) => {
  const [error, setError] = createSignal(props.error());

  onError((err) => {
    setError(err);
  });

  return (
    <Show
      when={!error()}
      fallback={
        <ErrorWrapper error={error()}>{<props.component />}</ErrorWrapper>
      }
    >
      {props.children({})}
    </Show>
  );
};

export interface ErrorWrapperProps {
  error: unknown;
  children: JSX.Element;
}

export const ErrorWrapper = (props: ErrorWrapperProps) => {
  return (
    <RouteErrorContext.Provider value={{ error: props.error }}>
      {props.children}
    </RouteErrorContext.Provider>
  );
};

export const DefaultErrorElement = () => {
  const error = useRouteError();

  const message = () => {
    const err = error();

    if (isRouteErrorResponse(err)) {
      return `${err.status} ${err.statusText}`;
    } else if (err instanceof Error) {
      return err.message;
    } else {
      return JSON.stringify(err);
    }
  };

  const stack = () => {
    const err = error();

    if (err instanceof Error) {
      return err.stack;
    }
  };

  const lightgrey = "rgba(200,200,200,0.5)";
  const preStyles = { padding: "0.5rem", backgroundColor: lightgrey };
  const codeStyles = { padding: "2px 4px", backgroundColor: lightgrey };

  return (
    <>
      <h2>Unhandled Thrown Error!</h2>
      <h3 style={{ "font-style": "italic" }}>{message()}</h3>
      <Show when={stack()}>
        <pre style={preStyles}>{stack()}</pre>
      </Show>
      <p>💿 Hey developer 👋</p>
      <p>
        You can provide a way better UX than this when your app throws errors by
        providing your own
        <code style={codeStyles}>errorElement</code>
        props on your routes
      </p>
    </>
  );
};
