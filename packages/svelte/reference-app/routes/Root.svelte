<script>
  import {
    Outlet,
    Link,
    useNavigate,
    useLocation,
    useNavigation,
    useNavigationType,
    useMatches,
  } from "remix-router-svelte";

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

  const hooks = {
    navigationType: JSON.stringify(useNavigationType()),
    location: JSON.stringify(useLocation()),
    navigation: JSON.stringify(useNavigation()),
    matches: JSON.stringify(useMatches()),
  };

  let navigate = useNavigate();
</script>

<h1>Root Layout</h1>
<nav>
  {#each Object.entries(links) as [text, href]}
    <Link to={href}>{text}</Link>
  {/each}
  <button id="back" on:click={() => navigate(-1)}>Go Back</button>
</nav>
{#each Object.entries(hooks) as [k, v] (k)}
  <p>
    {k}():
  </p>
  <pre id={k}>{v}</pre>
{/each}
<Outlet />
