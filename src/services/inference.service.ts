// -----------------------------------------------------------------------------
// Author:  Samuel Lörtscher
// Date:    25 January 2026
// Project: LectorGPT: LaTeX text refinement powered by OpenAI and Google
// -----------------------------------------------------------------------------

//

// import all required third party modules
import * as vsc from "vscode";

// import all required project modules
import { Ux } from "@lectorgpt/utils";
import { ModelDescriptor } from "@lectorgpt/descriptors";
import { ModelProvider } from "@lectorgpt/providers";

//

// -----------------------------------------------------------------------------
// Module Scoped (Private) Types & Functions
// -----------------------------------------------------------------------------

//

let inferenceInProgress = false;

//

// -----------------------------------------------------------------------------
// Exported Public Interface
// -----------------------------------------------------------------------------

//

export type RefineTextParams = {
    provider: ModelProvider;
    model: ModelDescriptor;
    systemPrompt: string;
    userPrompt: string;
};

/**
 * The InferenceService is responsible for performing inferences using the
 * provided model provider, model, system- and user prompt, managing the
 * inference state, and reporting progress and errors to the user.
 *
 * @author Samuel Lörtscher
 */
export const InferenceService = {
    /**
     * Refines the given text using the specified model provider, model,
     * system prompt, and user prompt. Manages the inference state and
     * reports progress and errors to the user.
     *
     * @param params - The parameters for the text refinement
     * @returns The refined text or undefined when an error occurred
     *
     * @author Samuel Lörtscher
     */
    refineText: async ({
        provider,
        model,
        systemPrompt,
        userPrompt,
    }: RefineTextParams): Promise<string | undefined> => {
        // prevent multiple concurrent inferences, as this might lead to
        // unexpected behavior and performance issues. Instead, the user is
        // informed that an inference is already in progress and the new
        // inference request is rejected until the current one finishes
        if (inferenceInProgress) {
            vsc.window.showErrorMessage(
                "LectorGPT: An inference is already in progress. " +
                    "Please wait until it finishes.",
            );

            return undefined;
        }

        // the inference state has to be updated
        // before starting the inference
        inferenceInProgress = true;

        // a status bar item is used to provide
        // feedback about the ongoing inference
        const item = vsc.window.createStatusBarItem(
            vsc.StatusBarAlignment.Right,
            100,
        );

        try {
            // the status bar item is updated to indicate that
            // the inference is in progress, showing the name of
            // the model being used for inference
            item.text = "$(sync~spin) LectorGPT";
            item.tooltip = `Refining selection using ${model.name}…`;
            item.show();

            // the inference is performed using the provided model provider and
            // the given system and user prompt. The inference is wrapped in a
            // progress notification, allowing the user to cancel the inference
            // if it takes too long. If the user cancels the inference, the
            // abort signal is triggered to stop the inference process
            const abort = new AbortController();
            const response = await vsc.window.withProgress(
                {
                    location: vsc.ProgressLocation.Notification,
                    title: `LectorGPT: Refining selection using ${model.name}…`,
                    cancellable: true,
                },
                async (_, token) => {
                    token.onCancellationRequested(() => abort.abort());
                    return await provider.refineText({
                        model,
                        systemPrompt,
                        userPrompt,
                        abortSignal: abort.signal,
                    });
                },
            );

            // the inference might fail for various reasons, such as
            // network issues, API errors, or if the user cancels the
            // inference. In any case, the user should be informed about
            // the error, unless the inference was cancelled by the user,
            // in which case no error message is shown
            if (response.kind === "failure") {
                if (!abort.signal.aborted) {
                    vsc.window.showErrorMessage(
                        `LectorGPT: ${Ux.withContext(
                            response.context,
                            response.error,
                        )}`,
                    );
                }

                return undefined;
            }

            // the model might return an empty response, which is not useful
            // for the user. In this case, a warning message is shown to
            // inform the user that the model did not return any output,
            // and undefined is returned to indicate that no refined text
            // is available
            if (!response.value.trim()) {
                vsc.window.showWarningMessage(
                    "LectorGPT: Model returned empty output.",
                );

                return undefined;
            }

            // the response value is trimmed to remove any leading or trailing
            // whitespace, which might be added by the model but is usually not
            // desired in the final output. By trimming the response, we ensure
            // that the suggestion is clean and does not contain unnecessary
            // whitespace
            return response.value.trim();
        } finally {
            // regardless of whether the inference was successful, failed, or
            // cancelled, the status bar item should be disposed to clean up
            // resources and remove the item from the status bar
            item.dispose();

            // the inference state is reset to allow
            // new inferences to be performed
            inferenceInProgress = false;
        }
    },
} as const;
