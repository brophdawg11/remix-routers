<script>
  import { Outlet, Link } from "remix-router-svelte";

  const links = {
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
</script>

<h1>Root Layout</h1>

<nav>
  {#each Object.entries(links) as [text, href]}
    <Link to={href}>{text}</Link>
  {/each}
</nav>
<Outlet />
