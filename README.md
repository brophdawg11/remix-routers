# 💿 Remix Routers

Remix Routers is a collection of libraries that port [`react-router-dom`][react-router-dom] (version 6.4 - currently in prerelease) to different UI rendering libraries, all based on the underlying [`@remix-run/router`][remix-router] package. This only exists for **Vue** and **Svelte** at the moment but we hope to see that expand in the future (with community support 😉).

If you're not familiar with the concepts of the Remix Router, we would highly recommend reading/watching the following to provide some background:

- 📖 [Remixing React Router][remixing-react-router]
- 📹 [When to Fetch: Remixing React Router][when-to-fetch] (Reactathon 2022)
- 📹 [Why the Form: Data Mutations on the Web][why-the-form] (RenderATL 2022)
- 📖 [React Router Tutorial][rr-tutorial]
  - This is likely the **best** way to get your hands dirty and learn the APIs

## Installation

> **Warning**
>
> These projects are in an early stage so use with caution!

Please refer to the documentation for the UI library of your choice:

- [remix-router-vue][vue-readme]
- [remix-router-svelte][svelte-readme]

## Design Goals

For simplicity and to keep things consistent between `react-router-dom` and these implementations, these implementations follow a few guidelines:

1. Implementations only provide data routers (no `BrowserRouter`, `HashRouter`, etc.)
2. Implementations will not provide any new APIs that are not in `react-router-dom`
3. Implementations will likely not provide all public APIs of `react-router-dom`
   - Some APIs may not be as relevant in a data-router-only landscape
   - Some APIs may not be compatible with a given UI library
4. Implementations will remain as close to the `react-router-dom` behavior as possible, barring differences that are unavoidable due to UI library implementation details
   - To this end, each package in this repository will implement the same reference app that must pass a shared Cypress test suite

## Non-Goals

1. SSR is not something we intend to handle in these implementations, at least for now

## API

In the interest of time (for now), please refer to the [docs for `react-router@6.4`][rr-docs] for API references since we're aiming to be API compatible. The following table documents the current state of the UI libraries and the APIs implemented. If you find cases where these packages are not API compatible, please open an issue (or better yet, a pull request!).

_Legend:_ ✅ (Included), ⏳ (Coming soon), ❌ (Not planned), Empty (Status unknown)

| API                        | React Router | Vue | Svelte |
| -------------------------- | ------------ | --- | ------ |
| **ROUTE**                  | -            | -   | -      |
| `action`                   | ✅           | ✅  | ✅     |
| `caseSensitive`            | ✅           | ✅  | ✅     |
| `children`                 | ✅           | ✅  | ✅     |
| `element`                  | ✅           | ✅  | ✅     |
| `errorElement`             | ✅           | ✅  |        |
| `id`                       | ✅           | ✅  | ✅     |
| `index`                    | ✅           | ✅  | ✅     |
| `loader`                   | ✅           | ✅  | ✅     |
| `path`                     | ✅           | ✅  | ✅     |
| `shouldRevalidate`         | ✅           | ✅  | ✅     |
| **COMPONENTS**             | -            | -   |
| `Await`                    | ✅           | ✅  |        |
| `Form`                     | ✅           | ✅  | ✅     |
| `Link`                     | ✅           | ✅  | ✅     |
| `NavLink`                  | ✅           | ⏳  |
| `Navigate`                 | ✅           |     |
| `Outlet`                   | ✅           | ✅  | ✅     |
| `Route`                    | ✅           | ❌  | ❌     |
| `Routes`                   | ✅           | ❌  | ❌     |
| `ScrollRestoration`        | ✅           | ⏳  |
| **ROUTERS**                | -            | -   |
| `createBrowserRouter`      | ✅           | ✅  | ✅     |
| `createHashRouter`         | ✅           | ✅  | ✅     |
| `createMemoryRouter`       | ✅           | ✅  | ✅     |
| `BrowserRouter`            | ✅           | ❌  | ❌     |
| `HashRouter`               | ✅           | ❌  | ❌     |
| `HistoryRouter`            | ✅           | ❌  | ❌     |
| `MemoryRouter`             | ✅           | ❌  | ❌     |
| `NativeRouter`             | ✅           | ❌  | ❌     |
| `Router`                   | ✅           | ❌  | ❌     |
| `RouterProvider`           | ✅           | ✅  | ✅     |
| `StaticRouter`             | ✅           | ❌  | ❌     |
| **HOOKS**                  | -            | -   | -      |
| `useActionData`            | ✅           | ✅  | ⏳     |
| `useAsyncValue`            | ✅           | ⏳  |        |
| `useAsyncError`            | ✅           | ⏳  |        |
| `useFetcher`               | ✅           | ✅  | ✅     |
| `useFetchers`              | ✅           | ✅  | ⏳     |
| `useFormAction`            | ✅           | ✅  | ✅     |
| `useHref`                  | ✅           | ✅  |        |
| `useInRouterContext`       | ✅           |     |        |
| `useLinkClickHandler`      | ✅           |     |        |
| `useLinkPressHandler`      | ✅           |     |        |
| `useLoaderData`            | ✅           | ✅  | ✅     |
| `useLocation`              | ✅           | ✅  | ✅     |
| `useMatch`                 | ✅           |     |
| `useMatches`               | ✅           | ✅  | ✅     |
| `useNavigate`              | ✅           | ✅  | ✅     |
| `useNavigation`            | ✅           | ✅  | ✅     |
| `useNavigationType`        | ✅           | ✅  | ✅     |
| `useOutlet`                | ✅           |     |        |
| `useOutletContext`         | ✅           |     |        |
| `useParams`                | ✅           |     |        |
| `useResolvedPath`          | ✅           | ✅  |        |
| `useRevalidator`           | ✅           | ⏳  |        |
| `useRouteError`            | ✅           | ✅  |        |
| `useRouteLoaderData`       | ✅           | ✅  | ✅     |
| `useRoutes`                | ✅           | ❌  |        |
| `useSearchParams`          | ✅           |     |        |
| `useSubmit`                | ✅           | ✅  |        |
| **FETCH UTILITIES**        | -            | -   |        |
| `json`                     | ✅           | ✅  |        |
| `redirect`                 | ✅           | ✅  |        |
| **UTILITIES**              | -            | -   |        |
| `createRoutesFromChildren` | ✅           | ❌  | ❌     |
| `createSearchParams`       | ✅           |     |        |
| `defer`                    | ✅           | ✅  |        |
| `generatePath`             | ✅           |     |        |
| `isRouteErrorResponse`     | ✅           | ✅  |        |
| `matchPath`                | ✅           |     |        |
| `matchRoutes`              | ✅           |     |        |
| `renderMatches`            | ✅           |     |        |
| `resolvePath`              | ✅           |     |        |

## Contributing

We welcome contributions from the community! Feel free to open issues and/or PRs and if you have any questions specific to a framework, please reach out to the following "leads":

- Vue - [@brophdawg11][brophdawg11]
- Svelte - [@austincrim][austincrim]

### Repository Setup

This repository uses [yarn workspaces][workspaces], and each implementation should be a new `packages/{library}` workspace. Each implementation should provide the following:

- A `package.json` with at least `build` and `integration` scripts
- A `src/` folder containing the UI implementation
- A `reference-app/` folder containing the reference application
- A `vite.config.ts` configuration to build the library (via `vite build`) and also serve the reference app (via `vite dev`)

[react-router-dom]: https://www.npmjs.com/package/react-router-dom
[remix-router]: https://www.npmjs.com/package/@remix-run/router
[remixing-react-router]: https://remix.run/blog/remixing-react-router
[when-to-fetch]: https://www.youtube.com/watch?v=95B8mnhzoCM
[why-the-form]: https://www.youtube.com/watch?v=CbW6gGfXUE8
[rr-docs]: https://reactrouter.com/en/dev
[rr-tutorial]: https://reactrouter.com/en/dev/getting-started/tutorial
[workspaces]: https://classic.yarnpkg.com/lang/en/docs/workspaces
[vue-readme]: ./packages/vue#readme
[svelte-readme]: ./packages/svelte#readme
[brophdawg11]: https://github.com/brophdawg11/
[austincrim]: https://github.com/austincrim/
