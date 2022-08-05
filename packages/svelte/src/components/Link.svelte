<script lang="ts">
  import {
    getRouterContext,
    shouldProcessLinkClick,
  } from "remix-router-svelte";

  export let to: string;

  const { router } = getRouterContext();

  function onClick(event) {
    let target =
      typeof $$restProps.target === "string" ? $$restProps.target : undefined;
    if (!shouldProcessLinkClick(event, target)) {
      return;
    }
    event.preventDefault();
    router.navigate(to);
  }
</script>

<a on:click={onClick} href={to}>
  <slot />
</a>
