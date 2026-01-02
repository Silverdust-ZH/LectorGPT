// -----------------------------------------------------------------------------
// Author:  Samuel Lörtscher
// Date:    25 January 2026
// Project: LectorGPT: LaTeX text refinement powered by OpenAI and Google
// -----------------------------------------------------------------------------

//

// import all required third party modules
import OpenAI from "openai";

// import all required project modules
import { Result } from "@lectorgpt/types";
import { ModelProvider, RefineTextParams } from "@lectorgpt/providers/model";

//

// -----------------------------------------------------------------------------
// Exported Public Interface
// -----------------------------------------------------------------------------

//

export class OpenAIModelProvider implements ModelProvider {
    constructor(private client: OpenAI) {}

    /**
     * Lists all available models.
     *
     * @author Samuel Lörtscher
     */
    async listModels(): Promise<Result<string[]>> {
        try {
            // fetch a list of supported OpenAI models
            const response = await this.client.models.list();

            // extract the model IDs and return them as a success result
            return Result.success(
                (response?.data ?? []).map((model) => `openai:${model.id}`),
            );
        } catch (exp: unknown) {
            // return an error result in case of failure
            return Result.failure(
                "Failed to fetch a list of supported OpenAI models",
                exp,
            );
        }
    }

    //

    //

    /**
     * Refines the given text using the specified model and prompts.
     *
     * @param params - Parameters including the model, system prompt,
     *                 user prompt, and abort signal.
     *
     * @author Samuel Lörtscher
     */
    async refineText({
        model,
        systemPrompt,
        userPrompt,
        abortSignal,
    }: RefineTextParams): Promise<Result<string>> {
        try {
            // invoke the model with the system and user prompts
            const response = await this.client.responses.create(
                {
                    model: model.id,
                    instructions: systemPrompt,
                    input: userPrompt,
                },
                {
                    signal: abortSignal,
                },
            );

            // return a refined, trimmed version of the input text
            return Result.success(response.output_text?.trim());
        } catch (exp: unknown) {
            // return a failure result in case of an error
            return Result.failure(
                "failed to perform text refinement request",
                exp,
            );
        }
    }
}
