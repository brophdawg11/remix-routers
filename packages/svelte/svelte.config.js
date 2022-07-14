import sveltePreprocess from "svelte-preprocess";

/** @type {import('@sveltejs/kit').Config} */
export default {
  // Consult https://github.com/sveltejs/svelte-preprocess
  // for more information about preprocessors
  preprocess: sveltePreprocess(),
  kit: {
    files: {
      lib: "src",
    },
    package: {
      dir: "dist",
      exports: (path) => {
        let denylist = [
          "dom.ts",
          "contexts/index.ts",
          "components/RouteWrapper.svelte",
        ];
        return !denylist.includes(path);
      },
    },
  },
};
