<script lang="ts">
import { LoaderFunction } from "@remix-run/router";
import { defineComponent } from "vue";

export const loader: LoaderFunction = async () => {
  await new Promise((r) => setTimeout(r, 1000));
  return {};
};

export default defineComponent({
  name: "Index",
});
</script>

<template>
  <h3>Index Page (nested)</h3>
  <p>Nothing to see here, no data loading!</p>
</template>
