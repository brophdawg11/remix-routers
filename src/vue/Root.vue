<script lang="ts">
import { defineComponent } from "vue";

import {
  Link,
  Outlet,
  useLocation,
  useMatches,
  useNavigation,
} from "../remix-router-vue";

export default defineComponent({
  name: "Root",
  components: {
    Link,
    Outlet,
  },
  setup() {
    return {
      location: useLocation(),
      navigation: useNavigation(),
      matches: useMatches(),
    };
  },
});
</script>

<template>
  <h1>Root Layout</h1>
  <nav>
    <Link to="/">Index</Link>
    &nbsp;
    <Link to="/tasks">Tasks</Link>
    &nbsp;
    <Link to="/tasks/new">Add Task</Link>
  </nav>
  <p>Current location: {{ location.pathname }}</p>
  <p>Current navigation: {{ navigation.state }}</p>
  <p>Current matches: {{ matches }}</p>
  <div
    :style="{
      border: '1px dotted grey',
      padding: '1rem',
      opacity: navigation.state === 'idle' ? 1 : 0.25,
    }"
  >
    <Outlet />
  </div>
</template>
