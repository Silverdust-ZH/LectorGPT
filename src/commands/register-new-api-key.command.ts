// -----------------------------------------------------------------------------
// Author:  Samuel Lörtscher
// Date:    25 January 2026
// Project: LectorGPT: LaTeX text refinement powered by OpenAI and Google
// -----------------------------------------------------------------------------

//

// import all required project modules
import { Command } from "@lectorgpt/types";
import { AsyncChain } from "@lectorgpt/utils";
import { VendorManager, SecretManager } from "@lectorgpt/managers";

//

// -----------------------------------------------------------------------------
// Exported Public Interface
// -----------------------------------------------------------------------------

//

/**
 * The `registerNewApiKey` command is responsible for registering a new API key
 * for the active vendor setup. It orchestrates a series of asynchronous
 * operations to resolve the active vendor setup and then register a new API key
 * for each vendor.
 *
 * @param title - The command title, used for user-facing messages and prompts.
 * @param context - The VS Code extension context.
 *
 * @returns A function that executes the command when invoked.
 *
 * @author Samuel Lörtscher
 */
export const registerNewApiKey: Command = ({ title, context }) => {
    return async () => {
        // setup a new async chain with the
        // active vendor setup as the initial value
        const chain = AsyncChain.from(
            "vendors",
            VendorManager.resolveActiveVendors(title),
        );

        // execute the chain of operations required for registering a new API
        // key (any error along the way will be caught, reported and cause an
        // early exit)
        await chain.run(({ vendors }) =>
            SecretManager.registerNewApiKey(context, vendors),
        );
    };
};
