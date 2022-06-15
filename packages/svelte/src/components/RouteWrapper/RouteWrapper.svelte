<script context="module">
  export const RouteContextSymbol = Symbol();
</script>

<script lang="ts">
  import { setContext } from "svelte";
  export let id: string;
  export let index: boolean;
  export let key: string;

  setContext(RouteContextSymbol, { id, index: index === true });
</script>

<slot />
