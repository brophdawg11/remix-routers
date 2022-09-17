# remix-router-preact

Preact UI implementation of the `react-router-dom` API (driven by `@remix-run/router`)

> **Warning**
>
> This project is in an early stage so use with caution!

## Installation

```bash
npm install remix-router-preact

# or

yarn add remix-router-preact
```

## Notable API Differences

n/a

## Example Usage

Please refer to the [beta docs for `react-router@6.4`][rr-docs] for reference on the APIs in question, but the following is a simple example of how to leverage `remix-router-preact` in a Preact application. You may also refer to the [reference application][reference-app] for a more extensive usage example.

**App.jsx**

```jsx
import { createBrowserRouter, RouterProvider } from "remix-router-preact";

import Layout from "./Layout.jsx";
import Index, { loader as indexLoader } from "./Index.jsx";

// Define your routes in a nested array, providing loaders and actions where
// appropriate
const routes = [
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        loader: indexLoader,
        element: <Index />,
      },
    ],
  },
];

// Provide a fallbackElement to be displayed during the initial data load
const fallbackElement = () => h("p", "Loading..."),

function App() {
  return <RouterProvider router={router} fallbackElement={<p>Loading...</p>} />
</template>
```

**Layout.jsx**

```jsx
import { Outlet } from "remix-router-preact";

export default function Layout() {
  return (
    <>
      {/* Render global-layout stuff here, such as a header and nav bar */}
      <h1>Welcome to my Vue Application!</h1>
      <nav><{/* nav links */}</nav>

      {/* Render matching child routes via <Outlet /> */}
      <Outlet />
    </>
  );
}
```

**Index.jsx**

```jsx
import { useLoaderData } from 'remix-router-vue';

export async function loader() {
  // Load your data here and return whatever you need access to in the UI
  return { ... };
};

export default function Index() {
  // Use the useLoaderData hook to access the data returned from your loader
  const data = useLoaderData();

return (
  <>
    <p>Check out my data!</p>
    <pre>{ data }</pre>
  </>
);
}
```

[rr-docs]: https://reactrouter.com/en/dev
[reference-app]: ./reference-app/
