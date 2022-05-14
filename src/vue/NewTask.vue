<script lang="ts">
import { ActionFunction } from "@remix-run/router";
import { computed, defineComponent } from "vue";

import { Form, useNavigation } from "../remix-router-vue";
import { addTask } from "../tasks";

export const action: ActionFunction = async ({ request }) => {
  let formData = await request.formData();
  await new Promise((r) => setTimeout(r, 1000));
  addTask(formData.get("newTask") as string);
  throw new Response(null, {
    status: 302,
    headers: {
      location: "/tasks",
    },
  });
};

export default defineComponent({
  name: "NewTask",
  components: {
    Form,
  },
  setup() {
    let navigation = useNavigation();
    let isAdding = computed(() => navigation.value.state !== "idle");
    return {
      isAdding,
    };
  },
});
</script>

<template>
  <h4>New Task</h4>
  <Form method="post" action="/tasks/new">
    <input name="newTask" />
    <button type="submit" :disabled="isAdding">
      {{ isAdding ? "Adding..." : "Add" }}
    </button>
  </Form>
</template>
