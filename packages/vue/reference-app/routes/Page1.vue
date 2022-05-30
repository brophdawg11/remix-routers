<script lang="ts">
import type { LoaderFunction } from "@remix-run/router";
import { sleep } from "../utils";

export const loader: LoaderFunction = async () => {
  await sleep();
  return {};
};
</script>

<script setup lang="ts"></script>

<template>
  <h2>Page 1</h2>
</template>
