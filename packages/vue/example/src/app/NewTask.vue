<script lang="ts">
import { ActionFunction, redirect } from "@remix-run/router";
import { Form, useNavigation } from "remix-router-vue";
import { computed, defineComponent } from "vue";

import { addTask } from "../tasks";

export const action: ActionFunction = async ({ request }) => {
  await new Promise((r) => setTimeout(r, 1000));
  let formData = await request.formData();
  addTask(formData.get("newTask") as string);
  return redirect("/tasks", { status: 302 });
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
