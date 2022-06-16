<script>
  import { Outlet, Link } from "remix-router-svelte";

  const links = {
    Index: "/",
    Parent: "/parent",
    Child: "/parent/child",
  };
</script>

<h1>Root route!</h1>

<nav>
  {#each Object.entries(links) as [text, href]}
    <Link to={href}>{text}</Link>
  {/each}
</nav>
<Outlet />
