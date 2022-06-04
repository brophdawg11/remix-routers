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
    <Link to="/parent">Parent</Link>
    &nbsp;
    <Link to="/parent/child">Child</Link>
    &nbsp;
    <Link to="/tasks">Tasks</Link>
    &nbsp;
    <Link to="/tasks/new">Add Task</Link>
  </nav>
  <div>
    Location:
    <pre id="location">{{ location }}</pre>
  </div>
  <div>
    Navigation:
    <pre id="navigation">{{ navigation }}</pre>
  </div>
  <div>
    Matches:
    <pre id="matches">{{ matches }}</pre>
  </div>
  <Outlet />
</template>
