// -----------------------------------------------------------------------------
// Author:  Samuel Lörtscher
// Date:    25 January 2026
// Project: LectorGPT: LaTeX text refinement powered by OpenAI and Google
// -----------------------------------------------------------------------------

//

// import all required project modules
import { Command } from "@lectorgpt/types";
import { SecretManager } from "@lectorgpt/managers";

//

// -----------------------------------------------------------------------------
// Exported Public Interface
// -----------------------------------------------------------------------------

//

/**
 * The `unregisterApiKey` command is responsible for unregistering an API key
 * associated with the active vendor setup. It invokes the `SecretManager` to
 * remove the stored API key from the extension's secrets storage, effectively
 * disconnecting the extension from the associated API vendor(s).
 *
 * @param context - The VS Code extension context.
 *
 * @returns A function that executes the command when invoked.
 *
 * @author Samuel Lörtscher
 */
export const unregisterApiKey: Command = ({ context }) => {
    return async () => {
        await SecretManager.unregisterApiKey(context);
    };
};
