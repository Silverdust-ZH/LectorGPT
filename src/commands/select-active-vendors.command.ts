// -----------------------------------------------------------------------------
// Author:  Samuel Lörtscher
// Date:    25 January 2026
// Project: LectorGPT: LaTeX text refinement powered by OpenAI and Google
// -----------------------------------------------------------------------------

//

// import all required project modules
import { Command } from "@lectorgpt/types";
import { VendorManager } from "@lectorgpt/managers";

//

// -----------------------------------------------------------------------------
// Exported Public Interface
// -----------------------------------------------------------------------------

//

/**
 * The `selectActiveVendors` command is responsible for selecting the active
 * vendor setup to be used for text refinement. It invokes the `VendorManager`
 * to allow the user to choose which vendors they want to use.
 *
 * @returns A function that executes the command when invoked.
 *
 * @author Samuel Lörtscher
 */
export const selectActiveVendors: Command = () => {
    return async () => {
        await VendorManager.selectActiveVendors();
    };
};
