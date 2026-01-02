// -----------------------------------------------------------------------------
// Author:  Samuel Lörtscher
// Date:    25 January 2026
// Project: LectorGPT: LaTeX text refinement powered by OpenAI and Google
// -----------------------------------------------------------------------------

const path = require("node:path");
const tsconfigPaths = require("tsconfig-paths");
const projectRoot = path.resolve(__dirname, "..");

tsconfigPaths.register({
    baseUrl: projectRoot,
    paths: {
        "@lectorgpt/*": ["out/src/*", "out/test/*"],
    },
});
