<script lang="ts">
  import type { FormMethod } from "@remix-run/router";

  import {
    useFormAction,
    submitForm,
    getRouterContext,
    getRouteContext,
  } from "remix-router-svelte";

  export let replace: boolean = false;
  export let onSubmit: Function = undefined;
  export let fetcherKey: string = null;
  type HTMLFormSubmitter = HTMLButtonElement | HTMLInputElement;

  let { router } = getRouterContext();
  let routeId = getRouteContext().id;
  let defaultAction = useFormAction($$restProps.action as string);

  function submit(event: SubmitEvent) {
    onSubmit && onSubmit(event);
    if (event.defaultPrevented) {
      return;
    }
    event.preventDefault();
    submitForm(
      router,
      defaultAction,
      (event.submitter as HTMLFormSubmitter) || event.currentTarget,
      {
        method: $$restProps.method as FormMethod,
        replace,
      },
      fetcherKey,
      routeId
    );
  }
</script>

<form {...$$restProps} on:submit={submit}>
  <slot />
</form>
