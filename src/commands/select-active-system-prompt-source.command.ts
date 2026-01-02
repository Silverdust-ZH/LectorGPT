// -----------------------------------------------------------------------------
// Author:  Samuel Lörtscher
// Date:    25 January 2026
// Project: LectorGPT: LaTeX text refinement powered by OpenAI and Google
// -----------------------------------------------------------------------------

//

// import all required project modules
import { Command } from "@lectorgpt/types";
import { PromptManager } from "@lectorgpt/managers";

//

// -----------------------------------------------------------------------------
// Exported Public Interface
// -----------------------------------------------------------------------------

//

/**
 * The `selectActiveSystemPromptSource` command is responsible for selecting the
 * active system prompt source to be used for text refinement. It invokes the
 * `PromptManager` to allow the user to choose a source for the system prompt,
 * which can be either an extension asset or an external file from a local or
 * remote file system.
 *
 * @returns A function that executes the command when invoked.
 *
 * @author Samuel Lörtscher
 */
export const selectActiveSystemPromptSource: Command = () => {
    return async () => {
        await PromptManager.selectActiveSource();
    };
};
