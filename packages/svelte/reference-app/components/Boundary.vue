<script setup lang="ts">
import { Link, useRouteError } from "remix-router-vue";

let error = useRouteError();
</script>

<template>
  <h2>Application Error Boundary</h2>
  <p>{{ error.message }}</p>
  <Link to="/">Go home</Link>
</template>
