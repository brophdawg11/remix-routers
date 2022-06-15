import type { Router, RouterState } from "@remix-run/router";
import { writable } from "svelte/store";

export interface RouterContext {
  router: Router;
  state: RouterState;
}

export const routerStore = writable<RouterContext>();
