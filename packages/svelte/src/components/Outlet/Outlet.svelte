<script lang="ts">
  import { getContext } from "svelte";
  import { RouteContextSymbol } from "../RouteWrapper/RouteWrapper.svelte";
  import { routerStore } from "../../stores/router";
  import RouteWrapper from "../RouteWrapper/RouteWrapper.svelte";

  export let root: boolean = false;

  let { matches } = $routerStore.router.state;
  let routeContext = root ? null : getContext(RouteContextSymbol);

  let idx = matches.findIndex((m) => m.route.id === routeContext?.id);
  if (idx < 0 && !root) {
    throw new Error(
      `Unable to find <Outlet /> match for route id: ${
        routeContext?.id || "_root_"
      }`
    );
  }
  let match = matches[idx + 1];
  let error =
    $routerStore.state.errors?.[match.route.id] != null
      ? Object.values($routerStore.state.errors)[0]
      : null;
</script>

{#if !match}
  <div />
{:else}
  {@const Component = match.route.element}
  <RouteWrapper
    id={match.route.id}
    index={match.route.index === true}
    key="{match.route.id}:{$routerStore.state.location.key}"
  >
    <Component />
  </RouteWrapper>
{/if}
