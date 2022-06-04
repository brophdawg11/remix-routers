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
const links = {
  Index: "/",
  Parent: "/parent",
  Child: "/parent/child",
  Redirect: "/redirect?location=%2Fparent%2Fchild",
  Tasks: "/tasks",
  "Add Task": "/tasks/new",
};
</script>

<template>
  <h1>Root Layout</h1>
  <nav>
    <Link v-for="(href, text) in links" :key="href" :to="href">{{ text }}</Link>
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
