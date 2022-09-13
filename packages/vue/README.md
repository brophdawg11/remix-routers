# remix-router-vue

Vue UI implementation of the `react-router-dom` API (driven by `@remix-run/router`)

> **Warning**
>
> This project is in an early stage so use with caution!

## Installation

```bash
npm install remix-router-vue

# or

yarn add remix-router-vue
```

## Notable API Differences

- `<Await>` has a few small differences based on the Vue `<Suspense>` component
  - Instead of taking an `errorElement` prop, `<Await>` leverages an `#error` scoped slot to render errors. For an example, please refer to the `/defer` route in the Vue reference application.
  - `<Await>` will not capture and hand render-errors to the `#error` slot because render errors in Vue propagate to the _parent_ components of `<Suspense>`, and `<Await>` is a child component. See [Suspense Error Handling][suspense-error-handling] for more details

## Example Usage

Please refer to the [beta docs for `react-router@6.4`][rr-docs] for reference on the APIs in question, but the following is a simple example of how to leverage `remix-router-vue` in a Vue application. You may also refer to the [reference application][reference-app] for a more extensive usage example.

**App.vue**

```html
<script setup>
  import { createBrowserRouter, RouterProvider } from "remix-router-vue";
  import { h } from "vue";

  import Layout from "./Layout.vue";
  import Index, { loader as indexLoader } from "./Index.vue";

  // Define your routes in a nested array, providing loaders and actions where
  // appropriate
  const routes = [
    {
      path: "/",
      element: Layout,
      children: [
        {
          index: true,
          loader: indexLoader,
          element: Index,
        },
      ],
    },
  ];

  // Create a router from your routes
  const router = createBrowserRouter(routes);

  // Provide a fallbackElement to be displayed during the initial data load
  const fallbackElement = () => h("p", "Loading..."),
</script>

<template>
  <RouterProvider :router="router" :fallbackElement="fallbackElement" />
</template>
```

**Layout.vue**

```html
<script setup>
  import { Outlet } from "remix-router-vue";
</script>

<template>
  <!-- Render global-layout stuff here, such as a header and nav bar -->
  <h1>Welcome to my Vue Application!</h1>
  <nav><!-- nav links --></nav>

  <!-- Render matching child routes via <Outlet /> -->
  <Outlet />
</template>
```

**Index.vue**

```html
<script>
  import { useLoaderData } from 'remix-router-vue';

  export async function loader() {
    // Load your data here and return whatever you need access to in the UI
    return { ... };
  };
</script>

<script setup>
  // Use the useLoaderData composition API method to access the data returned
  // from your loader
  const data = useLoaderData();
</script>

<template>
  <p>Check out my data!</p>
  <pre>{{ data }}</pre>
</template>
```

[rr-docs]: https://reactrouter.com/en/dev
[reference-app]: ./reference-app/
[suspense-error-handling]: https://vuejs.org/guide/built-ins/suspense.html#error-handling
