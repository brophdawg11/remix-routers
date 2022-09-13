<script lang="ts">
  import type { Router } from "@remix-run/router";
  import { RouterContextSymbol } from "../contexts";
  import { onDestroy, setContext } from "svelte";
  import { writable } from "svelte/store";
  import Outlet from "./Outlet.svelte";

  export let router: Router = null;
  export let fallbackElement = null;

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
