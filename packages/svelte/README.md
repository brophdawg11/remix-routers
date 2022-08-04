# remix-router-svelte

Svelte UI implementation of the `react-router-dom` API (driven by `@remix-run/router`)

**⚠️ This repo is very much in an alpha state and production usage is _highly discouraged_**

## Installation

```bash
npm install remix-router-svelte

# or

yarn add remix-router-svelte
```

_Note: If you are using TypeScript you will need to use `patch-package` and copy the `@remix-run+router+0.1.0.patch` patch from this repo to internally change the `RouteObject.element` type from `React.ReactNode` to `any` for use with Svelte components._

## Notable API Differences

- For now, you must provide your routes through the `DataBrowserRouter` `routes` prop, we don't support the declarative JSX-style `<Route>` children approach used by `react-router-dom`

## Example Usage

Please refer to the [beta docs for `react-router@6.4`][rr-beta-docs] for reference on the APIs in question, but the following is a simple example of how to leverage `remix-router-svelte` in a Svelte application. You may also refer to the [reference application][reference-app] for a more extensive usage example.

**App.svelte**

```html
<script>
  import { DataBrowserRouter } from "remix-router-svelte";
  import Layout from "./Layout.svelte";
  import Index, { loader as indexLoader } from "./Index.svelte";

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
  const fallbackElement = "<p>loading...</p>";
  // or const fallbackElement = MySvelteComponent
</script>

<DataBrowserRouter {routes} {fallbackElement} />
```

**Layout.svelte**

```html
<script>
  import { Outlet } from "remix-router-svelte";
</script>

<!-- Render global-layout stuff here, such as a header and nav bar -->
<h1>Welcome to my Svelte Application!</h1>
<nav><!-- nav links --></nav>

<!-- Render matching child routes via <Outlet /> -->
<Outlet />
```

**Index.svelte**

```html
<script context="module">
  import { useLoaderData } from 'remix-router-svelte';

  export async function loader() {
    // Load your data here and return whatever you need access to in the UI
    return { ... };
  };
</script>

<script>
  // Use the useLoaderData method to access a store of the data returned
  // from your loader
  const data = useLoaderData();
</script>

<template>
  <p>Check out my data!</p>
  <pre>{$data}</pre>
</template>
```

[rr-beta-docs]: https://beta.reactrouter.com/en/dev
[reference-app]: ./reference-app/
