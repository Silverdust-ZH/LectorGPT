// -----------------------------------------------------------------------------
// Author:  Samuel Lörtscher
// Date:    25 January 2026
// Project: LectorGPT: LaTeX text refinement powered by OpenAI and Google
// -----------------------------------------------------------------------------

//

// import all required third party modules
import * as vsc from "vscode";

// import all required project modules
import { Commands } from "@lectorgpt/commands";

//

// -----------------------------------------------------------------------------
// Exported Public Interface
// -----------------------------------------------------------------------------

//

/**
 * Activates the extension. This function is called by VS Code when the
 * extension is activated. It registers all commands defined in the `Commands`
 * module with VS Code, allowing them to be invoked by the user. Each command is
 * associated with a unique identifier and a handler function that executes the
 * command's logic when invoked.
 *
 * @param context - The VS Code extension context.
 *
 * @author Samuel Lörtscher
 */
export async function activate(context: vsc.ExtensionContext) {
    // declare all command handlers
    const cmds = [
        {
            id: "lectorgpt.select-active-vendors",
            cmd: Commands.selectActiveVendors,
        },
        {
            id: "lectorgpt.register-new-api-key",
            cmd: Commands.registerNewApiKey,
        },
        { id: "lectorgpt.unregister-api-key", cmd: Commands.unregisterApiKey },
        {
            id: "lectorgpt.select-active-model",
            cmd: Commands.selectActiveModel,
        },
        {
            id: "lectorgpt.select-active-system-prompt-source",
            cmd: Commands.selectActiveSystemPromptSource,
        },
        {
            id: "lectorgpt.refine-active-selection",
            cmd: Commands.refineActiveSelection,
        },
    ];

    // look-up all command titles from the extension's package.json
    const cmdsWithTitles = cmds.map(({ id, cmd }) => {
        const pkgCmds = context.extension.packageJSON.contributes?.commands;
        const pkgCmd = pkgCmds?.find((cmd: any) => cmd?.command === id);
        const pkgTitle = pkgCmd?.title?.split(": ")?.[1]?.trim() ?? id;

        return { id, title: pkgTitle, cmd };
    });

    // register all commands with VS Code
    context.subscriptions.push(
        ...cmdsWithTitles.map(({ id, cmd, title }) => {
            return vsc.commands.registerCommand(id, cmd({ title, context }));
        }),
    );
}

/**
 * Deactivates the extension. This function is called by VS Code when the
 * extension is deactivated. It can be used to perform any necessary cleanup,
 * such as disposing of resources or saving state. In this implementation, no
 * specific cleanup is required, so the function is empty.
 *
 * @author Samuel Lörtscher
 */
export function deactivate() {}
