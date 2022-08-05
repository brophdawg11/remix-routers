<script lang="ts">
  import { setContext } from "svelte";
  import { RouteContextSymbol } from "../contexts";
  export let id: string;
  export let index: boolean;
  export let key: string;

  setContext(RouteContextSymbol, { id, index: index === true });
</script>

<!-- double check if only way -->
{#key key}
  <slot />
{/key}
