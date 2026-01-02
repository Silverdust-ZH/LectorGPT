// -----------------------------------------------------------------------------
// Author:  Samuel Lörtscher
// Date:    25 January 2026
// Project: LectorGPT: LaTeX text refinement powered by OpenAI and Google
// -----------------------------------------------------------------------------

//

// import all required third party modules
import * as vsc from "vscode";

// import all required project modules
import { Command } from "@lectorgpt/types";
import { AsyncChain } from "@lectorgpt/utils";
import { ProviderFactory } from "@lectorgpt/factories";
import { EditorService, InferenceService } from "@lectorgpt/services";
import {
    VendorManager,
    SecretManager,
    ModelManager,
    PromptManager,
} from "@lectorgpt/managers";

//

// -----------------------------------------------------------------------------
// Exported Public Interface
// -----------------------------------------------------------------------------

//

/**
 * The `refineActiveSelection` command is responsible for refining the selected
 * text in the active editor using the configured language model and system
 * prompt. It orchestrates a series of asynchronous operations to resolve the
 * active vendor setup, retrieve API keys, create model providers, determine the
 * active model and system prompt, and finally perform the text refinement
 * inference. The resulting suggestion is then inserted back into the editor.
 *
 * @param title - The command title, used for user-facing messages and prompts.
 * @param context - The VS Code extension context.
 *
 * @returns A function that executes the command when invoked.
 *
 * @author Samuel Lörtscher
 */
export const refineActiveSelection: Command = ({ title, context }) => {
    return async () => {
        // nothing meaningful can be done without an active
        // text editor, so early bail is warranted
        const textEditor = vsc.window.activeTextEditor;
        if (!textEditor) {
            return;
        }

        // setup a new async chain with the
        // current selection as the initial value
        const chain = AsyncChain.from(
            "selection",
            EditorService.getCurrentSelection(textEditor),
        );

        // execute the chain of operations required
        // for refining the selected text
        await chain
            .bind("vendors", () => {
                return VendorManager.resolveActiveVendors(title);
            })
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
            .bind("model", ({ vendors, providers }) => {
                return ModelManager.resolveActiveModel(
                    context,
                    vendors,
                    [...providers.values()],
                    title,
                );
            })
            .bind("systemPromptSource", () => {
                return PromptManager.resolveActiveSource();
            })
            .bind("systemPrompt", ({ systemPromptSource }) => {
                return PromptManager.loadActiveSystemPrompt(
                    context,
                    systemPromptSource,
                );
            })
            .bind(
                "suggestion",
                ({ providers, model, systemPrompt, selection }) => {
                    return InferenceService.refineText({
                        provider: providers.get(model.vendor)!,
                        model,
                        systemPrompt,
                        userPrompt: textEditor.document.getText(selection),
                    });
                },
            )
            .run(async ({ suggestion, model }) => {
                // finally insert the inferred suggestion and format the
                // document (any error along the way will be caught, reported
                // and cause an early exit)
                await EditorService.insertSuggestion(
                    textEditor,
                    suggestion,
                    model,
                );

                // format the selection after inserting the
                // inferred suggestion to ensure proper indentation
                await vsc.commands.executeCommand(
                    "editor.action.formatDocument",
                );
            });
    };
};
