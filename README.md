# 💿 Remix Routers

Remix Routers is a collection of libraries that port `react-router-dom` to different UI rendering libraries, all based on the underlying `@remix-run/router` package. This only exists for **Vue** at the moment but I hope to see that expand in the future (with community support 😉).

**⚠️ This repo is very much in an alpha state and production usage is _highly discouraged_**

## Installation

Please refer to the documentation for the UI library of your choice:

- [Vue][vue-readme]

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

In the interest of time (for now) please refer to the [beta docs for `react-router@6.4`][rr-beta-docs] since we're aiming to be API compatible. The following table documents the current state of the UI libraries and the APIs implemented.

_Legend:_ ✅ (Included), ⏳ (Coming soon), ❌ (Not planned), Empty (Status unknown)

| API                        | React Router | Vue |
| -------------------------- | ------------ | --- |
| **ROUTE**                  | -            | -   |
| `action`                   | ✅           | ✅  |
| `caseSensitive`            | ✅           | ✅  |
| `children`                 | ✅           | ✅  |
| `element`                  | ✅           | ✅  |
| `errorElement`             | ✅           | ✅  |
| `id`                       | ✅           | ✅  |
| `index`                    | ✅           | ✅  |
| `loader`                   | ✅           | ✅  |
| `path`                     | ✅           | ✅  |
| `shouldRevalidate`         | ✅           | ✅  |
| **COMPONENTS**             | -            | -   |
| `Form`                     | ✅           | ✅  |
| `Link`                     | ✅           | ✅  |
| `NavLink`                  | ✅           | ⏳  |
| `Navigate`                 | ✅           |     |
| `Outlet`                   | ✅           | ✅  |
| `Route`                    | ✅           | ❌  |
| `Routes`                   | ✅           | ❌  |
| `ScrollRestoration`        | ✅           | ⏳  |
| **ROUTERS**                | -            | -   |
| `BrowserRouter`            | ✅           | ❌  |
| `DataBrowserRouter`        | ✅           | ✅  |
| `DataHashRouter`           | ✅           | ⏳  |
| `DataMemoryRouter`         | ✅           | ⏳  |
| `HashRouter`               | ✅           | ❌  |
| `HistoryRouter`            | ✅           | ❌  |
| `MemoryRouter`             | ✅           | ❌  |
| `NativeRouter`             | ✅           | ❌  |
| `Router`                   | ✅           | ❌  |
| `StaticRouter`             | ✅           | ❌  |
| **HOOKS**                  | -            | -   |
| `useActionData`            | ✅           | ✅  |
| `useFetcher`               | ✅           | ✅  |
| `useFetchers`              | ✅           | ✅  |
| `useFormAction`            | ✅           | ✅  |
| `useHref`                  | ✅           |     |
| `useInRouterContext`       | ✅           |     |
| `useLinkClickHandler`      | ✅           |     |
| `useLinkPressHandler`      | ✅           |     |
| `useLoaderData`            | ✅           | ✅  |
| `useLocation`              | ✅           | ✅  |
| `useMatch`                 | ✅           |     |
| `useMatches`               | ✅           | ✅  |
| `useNavigate`              | ✅           | ✅  |
| `useNavigation`            | ✅           | ✅  |
| `useNavigationType`        | ✅           | ⏳  |
| `useOutlet`                | ✅           |     |
| `useOutletContext`         | ✅           |     |
| `useParams`                | ✅           |     |
| `useResolvedPath`          | ✅           |     |
| `useRevalidator`           | ✅           | ⏳  |
| `useRouteError`            | ✅           | ✅  |
| `useRouteLoaderData`       | ✅           | ✅  |
| `useRoutes`                | ✅           | ❌  |
| `useSearchParams`          | ✅           |     |
| `useSubmit`                | ✅           | ⏳  |
| **FETCH UTILITIES**        | -            | -   |
| `isRouteErrorResponse`     | ✅           | ✅  |
| `json`                     | ✅           | ✅  |
| `redirect`                 | ✅           | ✅  |
| **UTILITIES**              | -            | -   |
| `createRoutesFromChildren` | ✅           | ❌  |
| `createSearchParams`       | ✅           |     |
| `generatePath`             | ✅           |     |
| `matchPath`                | ✅           |     |
| `matchRoutes`              | ✅           |     |
| `renderMatches`            | ✅           |     |
| `resolvePath`              | ✅           |     |

## Contributing

_Coming soon..._

### Repository Setup

This repository uses [yarn workspaces][workspaces], and each implementation should be a new `packages/{library}` workspace. Each implementation should provide the following:

- A `package.json` with at least `build` and `integration` scripts
- A `src/` folder containing the UI implementation
- A `reference-app/` folder containing the reference application
- A `vite.config.ts` configuration to build the library (via `vite build`) and also serve the reference app (via `vite dev`)

[rr-beta-docs]: https://beta.reactrouter.com/en/v6.4.0-pre.2
[workspaces]: https://classic.yarnpkg.com/lang/en/docs/workspaces
[vue-readme]: ./packages/vue#readme
