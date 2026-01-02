// -----------------------------------------------------------------------------
// Author:  Samuel Lörtscher
// Date:    25 January 2026
// Project: LectorGPT: LaTeX text refinement powered by OpenAI and Google
// -----------------------------------------------------------------------------

//

// import all required project modules
import { selectActiveVendors } from "./select-active-vendors.command";
import { registerNewApiKey } from "./register-new-api-key.command";
import { unregisterApiKey } from "./unregister-api-key.command";
import { selectActiveModel } from "./select-active-model.command";
import { selectActiveSystemPromptSource } from "./select-active-system-prompt-source.command";
import { refineActiveSelection } from "./refine-active-selection.command";

//

// -----------------------------------------------------------------------------
// Exported Public Interface
// -----------------------------------------------------------------------------

//

export const Commands = {
    selectActiveVendors,
    registerNewApiKey,
    unregisterApiKey,
    selectActiveModel,
    selectActiveSystemPromptSource,
    refineActiveSelection,
} as const;
