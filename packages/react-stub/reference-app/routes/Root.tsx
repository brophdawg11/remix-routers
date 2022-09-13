import {
  Link,
  Outlet,
  useLocation,
  useMatches,
  useNavigate,
  useNavigation,
  useNavigationType,
} from "react-router-dom";

export default function Root() {
  let links = {
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
  let hooks = {
    navigationType: JSON.stringify(useNavigationType()),
    location: JSON.stringify(useLocation()),
    navigation: JSON.stringify(useNavigation()),
    matches: JSON.stringify(useMatches()),
  };
  let navigate = useNavigate();

  return (
    <>
      <h1>Root Layout (react)</h1>
      <nav>
        {Object.entries(links).map(([text, href]) => (
          <Link key={href} to={href}>
            {text}
          </Link>
        ))}
        <button id="back" onClick={() => navigate(-1)}>
          Go Back
        </button>
      </nav>
      {Object.entries(hooks).map(([k, v]) => (
        <p key={k}>
          {k}():
          <code id={k}>{v}</code>
        </p>
      ))}
      <Outlet />
    </>
  );
}
