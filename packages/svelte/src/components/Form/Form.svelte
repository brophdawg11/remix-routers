<script lang="ts">
  import type { FormMethod } from "@remix-run/router";

  import {
    useFormAction,
    submitForm,
    getRouterContext,
  } from "remix-router-svelte";

  export let replace: boolean = false;
  export let onSubmit: Function = undefined;
  export let fetcherKey: string = null;
  type HTMLFormSubmitter = HTMLButtonElement | HTMLInputElement;

  let { router } = getRouterContext();
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
      fetcherKey
    );
  }
</script>

<form {...$$restProps} on:submit={submit}>
  <slot />
</form>

<!-- const FormImpl = defineComponent({
  name: "FormImpl",
  setup(props, { attrs, slots }) {
    let { router } = getRouterContext();
    let defaultAction = useFormAction(attrs.action as string);
    return () =>
      h(
        "form",
        {
          ...attrs,
          onSubmit(event: SubmitEvent) {
            props.onSubmit && props.onSubmit(event);
            if (event.defaultPrevented) {
              return;
            }
            event.preventDefault();
            submitForm(
              router,
              defaultAction,
              (event.submitter as HTMLFormSubmitter) || event.currentTarget,
              {
                method: attrs.method as FormMethod,
                replace: props.replace,
              },
              props.fetcherKey
            );
          },
        },
        slots.default?.()
      );
  },
}); -->
