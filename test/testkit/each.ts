// -----------------------------------------------------------------------------
// Author:  Samuel Lörtscher
// Date:    04 January 2026
// Project: LectorGPT: LaTeX inline text refinement powered by OpenAI and Gemini
// -----------------------------------------------------------------------------

//

// import all required third-party testing modules
import { test } from "mocha";

//

// -----------------------------------------------------------------------------
// Exported Public Interface
// -----------------------------------------------------------------------------

//

/**
 * Iterates over a set of test variants and creates a test for each variant.
 *
 * @param variants - An array of tuples, where each tuple contains a string
 * representing the variant name and an associated value.
 * @returns An object with a `test` method that can be used to define tests
 * for each variant.
 *
 * @author Samuel Lörtscher
 */
export const forEach = <T extends [string, unknown][]>(variants: T) => ({
    test: (title: string, fn: (v: T[number]) => () => void | Promise<void>) => {
        variants.forEach((v) => test(title.replace("%s", v[0]), fn(v)));
    },
});
