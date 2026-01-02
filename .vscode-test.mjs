// -----------------------------------------------------------------------------
// Author:  Samuel Lörtscher
// Date:    29 December 2025
// Project: LectorGPT (LaTeX inline text refinement powered by OpenAI models)
// -----------------------------------------------------------------------------

import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "@vscode/test-cli";

export default defineConfig({
    extensionDevelopmentPath: "./out",
    files: "out/test/src/**/*.test.js",

    // prettier-ignore
    launchArgs: [
        "--disable-gpu",
        "--disable-dev-shm-usage"
    ],

    coverage: {
        enabled: true,
        // Hier schließt du die Testdateien aus
        exclude: ["out/test/testkit/**"],
    },

    // prettier-ignore
    mocha: {
        ui: "bdd",
        require: [
            path.resolve(
                path.dirname(fileURLToPath(import.meta.url)),
                "test/register-paths.cjs"
            )
        ],
    },
});
