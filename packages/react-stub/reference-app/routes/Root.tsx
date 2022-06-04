import {
  Link,
  Outlet,
  useLocation,
  useMatches,
  useNavigation,
} from "react-router-dom";

export default function Root() {
  let location = JSON.stringify(useLocation());
  let navigation = JSON.stringify(useNavigation());
  let matches = JSON.stringify(useMatches());
  let links = {
    Index: "/",
    Parent: "/parent",
    Child: "/parent/child",
    Redirect: "/redirect?location=%2Fparent%2Fchild",
    "Loader Error": "/error?type=loader",
    "Render Error": "/error?type=render",
    "Nested Loader Error": "/parent/error?type=loader",
    "Nested Render Error": "/parent/error?type=render",
    Tasks: "/tasks",
    "Add Task": "/tasks/new",
  };

  return (
    <>
      <h1>Root Layout</h1>
      <nav>
        {Object.entries(links).map(([text, href]) => (
          <Link key={href} to={href}>
            {text}
          </Link>
        ))}
      </nav>
      <div>
        Location: <pre id="location">{location}</pre>
      </div>
      <div>
        Navigation: <pre id="navigation">{navigation}</pre>
      </div>
      <div>
        Matches: <pre id="matches">{matches}</pre>
      </div>
      <Outlet />
    </>
  );
}
