// -----------------------------------------------------------------------------
// Author:  Samuel Lörtscher
// Date:    29 December 2025
// Project: LectorGPT (LaTeX inline text refinement powered by OpenAI models)
// -----------------------------------------------------------------------------

import typescriptEslint from "typescript-eslint";

export default [
    {
        files: ["**/*.ts"],
    },
    {
        plugins: {
            "@typescript-eslint": typescriptEslint.plugin,
        },

        languageOptions: {
            parser: typescriptEslint.parser,
            ecmaVersion: 2022,
            sourceType: "module",
        },

        rules: {
            // "@typescript-eslint/explicit-function-return-type": "error",
            "@typescript-eslint/naming-convention": [
                "warn",
                {
                    selector: "import",
                    format: ["camelCase", "PascalCase"],
                },
            ],

            curly: "warn",
            eqeqeq: "warn",
            "no-throw-literal": "warn",
            semi: "warn",
        },
    },
];
