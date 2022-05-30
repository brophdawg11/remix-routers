<script setup lang="ts">
import {
  Link,
  Outlet,
  useLocation,
  useMatches,
  useNavigation,
} from "remix-router-vue";
import { computed } from "vue";

const location = computed(() => JSON.stringify(useLocation().value));
const navigation = computed(() => JSON.stringify(useNavigation().value));
const matches = computed(() => JSON.stringify(useMatches().value));
</script>

<template>
  <h1>Root Layout</h1>
  <nav>
    <Link to="/">Index</Link>
    &nbsp;
    <Link to="/page1">Page 1</Link>
    &nbsp;
    <Link to="/tasks">Tasks</Link>
    &nbsp;
    <Link to="/tasks/new">Add Task</Link>
  </nav>
  <p>Location: <pre id="location">{{ location }}</pre></p>
  <p>Navigation: <pre id="navigation">{{ navigation }}</pre></p>
  <p>Matches: <pre id="matches">{{ matches }}</pre></p>
  <Outlet />
</template>
