# Remix Routers 💿

A collection of `react-router-dom` implementations for various other UI
libraries, based on the underlying `@remix-run/router` package.

⚠️ ⚠️ ⚠️
**This is very much in an alpha state and thus production usage is _highly discouraged_. APIs will very likely change without notice until the API surface stabilizes a bit further.**
⚠️ ⚠️ ⚠️

## Design Goals

In order to keep things consistent between `react-router-dom` and these implementations, we lay out some explicit rules to guide the implementations. Therefore, implementations will:

1. Only provide data routers, and will not provide the non-data-routers present in React Router 6.3 and prior (`BrowserRouter`, etc.)
2. Only provide `DataBrowserRouter` to start, and will not provide `DataMemoryRouter` and `DataHashRouter`
3. Be strictly a _subset_ of the public API of `react-router-dom`, and will not provide any APIs that go beyond `react-router-dom`
   - Implementations may not implement _every_ API in `react-router-dom`
   - There were no Data APIs prior to React Router 6.4, so APIs may be skipped that are no longer relevant in a data-router-only landscape
4. Remain as close to the `react-router-dom` behavior as possible, barring differences that are unavoidable due to library implementation details
   - To achieve this we will aim to implement the same reference app for each library, and run the same E2E test suite against the reference apps

## Non-Goals

1. SSR is not something we intend to handle in these implementations
