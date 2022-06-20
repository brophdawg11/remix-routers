import type { Router, RouterState } from "@remix-run/router";
import { getContext } from "svelte";
import type { Writable } from "svelte/store";
export const RouteContextSymbol = Symbol();
export const RouterContextSymbol = Symbol();

export interface RouterContext {
  router: Router;
  state: Writable<RouterState>;
}

// Wrapper context holding the route location in the current hierarchy
export interface RouteContext {
  id: string;
  index: boolean;
}

export function getRouteContext(): RouteContext {
  return getContext(RouteContextSymbol);
}

export function getRouterContext(): RouterContext {
  return getContext(RouterContextSymbol);
}
