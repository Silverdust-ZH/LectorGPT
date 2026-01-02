// -----------------------------------------------------------------------------
// Author:  Samuel Lörtscher
// Date:    29 December 2025
// Project: LectorGPT (LaTeX inline text refinement powered by OpenAI models)
// -----------------------------------------------------------------------------

import esbuild from "esbuild";

await esbuild.build({
    entryPoints: ["src/extension.ts"],
    outfile: "dist/extension.js",
    bundle: true,
    platform: "node",
    target: "node18",
    format: "cjs",
    sourcemap: false,
    minify: true,
    external: ["vscode"],
    treeShaking: true,
});
