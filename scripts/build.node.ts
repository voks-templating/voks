import * as esbuild from "esbuild";
import { denoPlugins } from "esbuild_deno_loader";

await esbuild.build({
  plugins: [...denoPlugins()],
  entryPoints: ["mod.ts"],
  outfile: "dist/mod.js",
  bundle: true,
  format: "esm",
  // minify: true,
  sourcemap: true,
  target: "node18.8",
})
  .then((_res) => {
    console.log("build succeeded");
    Deno.exit(0);
  }).catch((error) => {
    console.log("build failed");

    console.log(error);
    Deno.exit(1);
  });
