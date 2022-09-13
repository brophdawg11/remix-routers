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
    // "Loader Error": "/error?type=loader",
    // "Render Error": "/error?type=render",
    // "Nested Loader Error": "/parent/error?type=loader",
    // "Nested Render Error": "/parent/error?type=render",
    Tasks: "/tasks",
  };

  let navigation = useNavigation();
  let matches = useMatches();
  let navigationType = useNavigationType();
  let location = useLocation();
  $: hooks = {
    navigationType: JSON.stringify($navigationType),
    location: JSON.stringify($location),
    navigation: JSON.stringify($navigation),
    matches: JSON.stringify($matches),
  };

  let navigate = useNavigate();
</script>

<h1>Root Layout (svelte)</h1>
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
