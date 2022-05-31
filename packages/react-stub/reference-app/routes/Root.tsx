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

  return (
    <>
      <h1>Root Layout</h1>
      <nav>
        <Link to="/">Index</Link>
        &nbsp;
        <Link to="/page1">Page 1</Link>
        &nbsp;
        <Link to="/tasks">Tasks</Link>
        &nbsp;
        <Link to="/tasks/new">Add Task</Link>
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
