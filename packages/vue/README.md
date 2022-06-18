# remix-router-vue

Vue UI implementation of the `react-router-dom` API (driven by `@remix-run/router`)

> **Warning**
> This repo is very much in an alpha state and production usage is highly discouraged

## Installation

```bash
npm install remix-router-vue

# or

yarn add remix-router-vue
```

_Note: If you are using TypeScript you will need to use `patch-package` and copy the `@remix-run+router+0.1.0.patch` patch from this repo to internally change the `RouteObject.element` type from `React.ReactNode` to `any` for use with Vue components._

## Notable API Differences

- For now, you must provide your routes through the `DataBrowserRouter` `routes` prop, we don't support the declarative JSX-style `<Route>` children approach used by `react-router-dom`

## Example Usage

Please refer to the [beta docs for `react-router@6.4`][rr-beta-docs] for reference on the APIs in question, but the following is a simple example of how to leverage `remix-router-vue` in a Vue application. You may also refer to the [reference application][reference-app] for a more extensive usage example.

**App.vue**

```html
<script setup>
  import { DataBrowserRouter } from "remix-router-vue";
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

  // Provide a fallbackElement to be displayed during the initial data load
  const fallbackElement = () => h("p", "Loading..."),
</script>

<template>
  <DataBrowserRouter :routes="routes" :fallbackElement="fallbackElement" />
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

[rr-beta-docs]: https://beta.reactrouter.com/en/dev
[reference-app]: ./reference-app/
