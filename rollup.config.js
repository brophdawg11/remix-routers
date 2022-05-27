import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";

import packageJsonVue from "./packages/vue/package.json";

function vueBuild() {
  let outputDir = "packages/vue";
  return [
    {
      input: "packages/vue/src/index.ts",
      output: [
        {
          format: "cjs",
          file: `${outputDir}/${packageJsonVue.main}`,
          sourcemap: true,
        },
        {
          format: "esm",
          file: `${outputDir}/${packageJsonVue.module}`,
          sourcemap: true,
        },
      ],
      external: ["@remix-run/router", "vue"],
      plugins: [
        typescript({ compilerOptions: { declaration: false } }),
        commonjs(),
      ],
    },
  ];
}

export default function rollup(options) {
  let builds = [...vueBuild(options)];

  return builds;
}
