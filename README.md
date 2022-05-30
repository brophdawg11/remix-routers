# 💿 Remix Routers

Remix Routers is a collection of libraries that port `react-router-dom` to different UI rendering libraries, all based on the underlying `@remix-run/router` package. This only exists for **Vue** at the moment but I hope to see that expand in the future (with community support 😉).

⚠️ ⚠️ ⚠️

**This is very much in an alpha state and thus production usage is _highly discouraged_. APIs will very likely change without notice until the API surface stabilizes a bit further.**

⚠️ ⚠️ ⚠️

## Installation

👷‍♂️ _Not published yet, soon!_

## Design Goals

In order to keep things consistent between `react-router-dom` and these implementations, we lay out some explicit rules. All implementations:

1. Only provide data routers, and will not provide the non-data-routers present in `react-router@6.3.0` and prior (`BrowserRouter`, etc.)
2. Be strictly a _subset_ of the public API of `react-router-dom`, and will not provide any APIs that go beyond `react-router-dom`
   - Implementations may not implement _every_ API in `react-router-dom`
   - There were no data APIs prior to React Router 6.4, so APIs may be skipped that are no longer as relevant in a data-router-only landscape
3. Remain as close to the `react-router-dom` behavior as possible, barring differences that are unavoidable due to library implementation details
   - To achieve this we will aim to implement the same reference app for each library, and run the same E2E test suite against the reference apps

## Non-Goals

1. SSR is not something we intend to handle in these implementations

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
| `errorElement`             | ✅           | ⏳  |
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
| `useRouteError`            | ✅           | ⏳  |
| `useRouteLoaderData`       | ✅           | ⏳  |
| `useRoutes`                | ✅           | ❌  |
| `useSearchParams`          | ✅           |     |
| `useSubmit`                | ✅           | ⏳  |
| **FETCH UTILITIES**        | -            | -   |
| `isRouteErrorResponse`     | ✅           | ⏳  |
| `json`                     | ✅           | ⏳  |
| `redirect`                 | ✅           | ⏳  |
| **UTILITIES**              | -            | -   |
| `createRoutesFromChildren` | ✅           | ❌  |
| `createSearchParams`       | ✅           |     |
| `generatePath`             | ✅           |     |
| `matchPath`                | ✅           |     |
| `matchRoutes`              | ✅           |     |
| `renderMatches`            | ✅           |     |
| `resolvePath`              | ✅           |     |

## Notable API Differences

### Vue

- For now, you must provide your routes through the `DataBrowserRouter` `routes` prop, we don't support the declarative JSX-style `<Route>` children approach used by `react-router-dom`

## Contributing

_TODO..._

### Repository Setup

This repository uses [npm workspaces][workspaces], and each implementation should be a new `packages/{library}` workspace. Each implementation should provide the following:

- A `package.json` with at least `build` and `reference-app` scripts
- A `src/` folder containing the UI implementation
- A `reference-app/` folder containing the reference application
- A `vite.config.ts` configuration to build the library (via `vite build`) and also serve the reference app (via `vite dev`)

[rr-beta-docs]: https://beta.reactrouter.com/en/v6.4.0-pre.2
[workspaces]: https://docs.npmjs.com/cli/v8/using-npm/workspaces
