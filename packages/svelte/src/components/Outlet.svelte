<script lang="ts">
  import { getRouterContext, getRouteContext } from "remix-router-svelte";
  import RouteWrapper from "./RouteWrapper.svelte";

  export let root: boolean = false;

  let { router, state } = getRouterContext();
  let routeContext = root ? null : getRouteContext();

  let idx = router.state.matches.findIndex(
    (m) => m.route.id === routeContext?.id
  );
  if (idx < 0 && !root) {
    throw new Error(
      `Unable to find <Outlet /> match for route id: ${
        routeContext?.id || "_root_"
      }`
    );
  }
  let match = router.state.matches[idx + 1];
  let error =
    router.state.errors?.[match.route.id] != null
      ? Object.values($state.errors)[0]
      : null;
</script>

{#if match}
  {@const Component = match.route.element}
  <RouteWrapper
    id={match.route.id}
    index={match.route.index === true}
    key="{match.route.id}:{$state.location.key}"
  >
    <Component />
  </RouteWrapper>
{/if}
