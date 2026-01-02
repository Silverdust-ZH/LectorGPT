// -----------------------------------------------------------------------------
// Author:  Samuel Lörtscher
// Date:    25 January 2026
// Project: LectorGPT: LaTeX text refinement powered by OpenAI and Google
// -----------------------------------------------------------------------------

//

// import all required third party modules
import sinon from "sinon";

//

// -----------------------------------------------------------------------------
// Exported Public Interface
// -----------------------------------------------------------------------------

//

/**
 * Returns a function that executes a given function within a dedicated Sinon
 * sandbox, automatically restoring that sandbox after execution.
 *
 * @param fn - The function to execute within the sandbox.
 *
 * @returns A promise that resolves when the function has completed execution.
 *
 * @author Samuel Lörtscher
 */
export const withSandbox = (
    fn: (sandbox: sinon.SinonSandbox) => Promise<void> | void,
): (() => Promise<void>) => {
    return async () => {
        // create a new Sinon sandbox
        const sandbox = sinon.createSandbox();

        try {
            // execute the provided function within the sandbox
            await fn(sandbox);
        } finally {
            // restore the sandbox to clean up all stubs and spies
            sandbox.restore();
        }
    };
};
