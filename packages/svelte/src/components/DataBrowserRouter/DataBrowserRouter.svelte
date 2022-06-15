<script lang="ts">
  import {
    createBrowserRouter,
    type HydrationState,
    type RouteObject,
  } from "@remix-run/router";
  import { routerStore } from "../../stores/router";
  import Outlet from "../Outlet/Outlet.svelte";

  export let routes: RouteObject[];
  export let hydrationData: HydrationState;

  let router = createBrowserRouter({
    routes,
    hydrationData,
  }).initialize();

  $routerStore = { router, state: router.state };
</script>

<Outlet root={true} />

<!-- export const DataBrowserRouter = defineComponent({
  name: "DataBrowserRouter",
  props: {
    routes: {
      type: Array as PropType<RouteObject[]>,
      required: true,
    },
    fallbackElement: {
      type: Object as PropType<Component>,
    },
    hydrationData: {
      type: Object as PropType<HydrationState>,
    },
  },
  setup(props) {
    let router = createBrowserRouter({
      routes: props.routes,
      hydrationData: props.hydrationData,
    }).initialize();
    return setupRouter(router, props.fallbackElement);
  },
}); -->
