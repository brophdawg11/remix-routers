<script lang="ts">
  import { setContext } from "svelte";
  import { RouteContextSymbol } from "remix-router-svelte";
  export let id: string;
  export let index: boolean;
  export let key: string;

  setContext(RouteContextSymbol, { id, index: index === true });
</script>

{#key key}
  <slot />
{/key}
