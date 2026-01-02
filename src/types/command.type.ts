// -----------------------------------------------------------------------------
// Author:  Samuel Lörtscher
// Date:    25 January 2026
// Project: LectorGPT: LaTeX text refinement powered by OpenAI and Google
// -----------------------------------------------------------------------------

//

// import all required third party modules
import * as vsc from "vscode";

//

// -----------------------------------------------------------------------------
// Exported Public Interface
// -----------------------------------------------------------------------------

//

/**
 * The Command type represents a function that takes an object with a title and
 * a VS Code extension context, and returns another function that performs an
 * asynchronous operation when invoked. This type is used to define the shape of
 * command implementations in the LectorGPT extension, allowing for consistent
 * handling of command registration and execution.
 *
 * @author Samuel Lörtscher
 */
export type Command = (args: {
    title: string;
    context: vsc.ExtensionContext;
}) => () => Promise<void>;
