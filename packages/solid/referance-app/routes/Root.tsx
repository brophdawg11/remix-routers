import {
  Link,
  Outlet,
  useLocation,
  useMatches,
  useNavigate,
  useNavigation,
  useNavigationType,
} from "remix-router-solid";
import { For } from "solid-js";

export const Root = () => {
  const links = {
    Index: "/",
    Parent: "/parent",
    Child: "/parent/child",
    Redirect: "/redirect?location=%2Fparent%2Fchild",
    "Loader Error": "/error?type=loader",
    "Render Error": "/error?type=render",
    "Nested Loader Error": "/parent/error?type=loader",
    "Nested Render Error": "/parent/error?type=render",
    Defer: "/defer",
    Tasks: "/tasks",
  };
  const hooks = {
    navigationType: useNavigationType(),
    location: useLocation(),
    navigation: useNavigation(),
    matches: useMatches(),
  };

  const navigate = useNavigate();

  return (
    <>
      <h1>Root Layout (solid)</h1>
      <nav>
        <For each={Object.entries(links)}>
          {([text, href]) => {
            return <Link to={href}>{text}</Link>;
          }}
        </For>
        <button id="back" onClick={() => navigate(-1)}>
          Go Back
        </button>
      </nav>
      <For each={Object.entries(hooks)}>
        {([k, v]) => {
          return (
            <p>
              {k}():
              <code id={k}>{JSON.stringify(v())}</code>
            </p>
          );
        }}
      </For>
      <Outlet />
    </>
  );
};
