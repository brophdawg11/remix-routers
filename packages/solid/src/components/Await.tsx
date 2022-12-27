import { AbortedDeferredError } from "@remix-run/router";
import {
  Accessor,
  Component,
  createResource,
  Match,
  Show,
  Switch,
} from "solid-js";
import { AsyncErrorContext } from "../context";

export interface AwaitProps<T> {
  resolve: Promise<T>;
  children: Component<Accessor<T>>;
  errorElement?: Component;
}

export function Await<T>(props: AwaitProps<T>) {
  const [data] = createResource(async () => {
    return props.resolve;
  });

  return (
    <Switch>
      <Match when={!data.error && data()}>
        {props.children(data as Accessor<T>)}
      </Match>

      <Match when={data.error}>
        <AwaitErrorBoundary
          error={data.error}
          errorElement={props.errorElement!}
        />
      </Match>
    </Switch>
  );
}

interface AwaitErrorBoundaryProps {
  errorElement: Component;
  error: unknown;
}

const AwaitErrorBoundary = (props: AwaitErrorBoundaryProps) => {
  const isAbortedDeferedError = () =>
    props.error instanceof AbortedDeferredError;

  return (
    <Show
      when={!isAbortedDeferedError()}
      fallback={ComponentWhichSuspendsForever}
    >
      <AsyncErrorContext.Provider value={props.error}>
        <props.errorElement />
      </AsyncErrorContext.Provider>
    </Show>
  );
};

const ComponentWhichSuspendsForever = () => {
  const [data] = createResource(
    async () =>
      new Promise(() => {
        // no op
      })
  );

  return <Show when={!data.error && data()}>It should not show</Show>;
};
