// -----------------------------------------------------------------------------
// Author:  Samuel Lörtscher
// Date:    25 January 2026
// Project: LectorGPT: LaTeX text refinement powered by OpenAI and Google
// -----------------------------------------------------------------------------

//

// import all required project modules
import { Command } from "@lectorgpt/types";
import { AsyncChain } from "@lectorgpt/utils";
import { ProviderFactory } from "@lectorgpt/factories";
import {
    VendorManager,
    ModelManager,
    SecretManager,
} from "@lectorgpt/managers";

//

// -----------------------------------------------------------------------------
// Exported Public Interface
// -----------------------------------------------------------------------------

//

/**
 * The `selectActiveModel` command is responsible for selecting the active model
 * to be used for text refinement. It orchestrates a series of asynchronous
 * operations to resolve the active vendor setup, retrieve API keys, create
 * model providers, and finally select the active model based on the available
 * providers.
 *
 * @param title - The command title, used for user-facing messages and prompts.
 * @param context - The VS Code extension context.
 *
 * @returns A function that executes the command when invoked.
 *
 * @author Samuel Lörtscher
 */
export const selectActiveModel: Command = ({ title, context }) => {
    return async () => {
        // setup a new async chain with the
        // active vendor setup as the initial value
        const chain = AsyncChain.from(
            "vendors",
            VendorManager.resolveActiveVendors(title),
        );

        // execute the chain of operations required for selecting the active
        // model (any error along the way will be caught, reported and cause an
        // early exit)
        await chain
            .bind("apiKeys", ({ vendors }) => {
                return SecretManager.resolveActiveApiKeys(
                    context,
                    vendors,
                    title,
                );
            })
            .bind("providers", ({ vendors, apiKeys }) => {
                return ProviderFactory.createProviderMap(vendors, apiKeys);
            })
            .run(({ vendors, providers }) => {
                ModelManager.selectActiveModel(context, vendors, [
                    ...providers.values(),
                ]);
            });
    };
};
