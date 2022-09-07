import * as _hooks from "preact/hooks";
export import Ref = _hooks.Ref;

export interface ForwardFn<P = any, T = any> {
  (props: P, ref: Ref<T>): preact.ComponentChild;
  displayName?: string;
}

export function forwardRef<R, P = any>(
  fn: ForwardFn<P, R>
): preact.FunctionalComponent<Omit<P, "ref"> & { ref?: preact.Ref<R> }>;
