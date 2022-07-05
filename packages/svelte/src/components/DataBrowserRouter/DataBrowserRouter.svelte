<script lang="ts">
  import {
    createBrowserRouter,
    type HydrationState,
    type RouteObject,
  } from "@remix-run/router";
  import { RouterContextSymbol } from "../../contexts/";
  import { onDestroy, setContext } from "svelte";
  import { writable } from "svelte/store";
  import Outlet from "../Outlet/Outlet.svelte";

  export let routes: RouteObject[];
  export let hydrationData: HydrationState = null;
  export let fallbackElement = null;

  let router = createBrowserRouter({
    routes,
    hydrationData,
  }).initialize();

  let stateRef = writable(router.state);
  router.subscribe(stateRef.set);

  setContext(RouterContextSymbol, { router, state: stateRef });
  onDestroy(() => {
    router.dispose();
  });
</script>

{#if !$stateRef.initialized}
  {#if typeof fallbackElement === "string"}
    {@html fallbackElement}
  {:else if typeof fallbackElement === "function"}
    <svelte:component this={fallbackElement} />
  {:else}
    <span />
  {/if}
{:else}
  <Outlet root={true} />
{/if}
