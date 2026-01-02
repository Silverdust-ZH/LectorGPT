// -----------------------------------------------------------------------------
// Author:  Samuel Lörtscher
// Date:    25 January 2026
// Project: LectorGPT: LaTeX text refinement powered by OpenAI and Google
// -----------------------------------------------------------------------------

//

// import all required third party modules
import { GoogleGenerativeAI } from "@google/generative-ai";

// import all required project modules
import { Result } from "@lectorgpt/types";
import { ModelProvider, RefineTextParams } from "@lectorgpt/providers/model";

//

type GeminiModel = {
    name: string;
    displayName?: string;
    description?: string;
    supportedGenerationMethods?: string[];
};

//

// -----------------------------------------------------------------------------
// Exported Public Interface
// -----------------------------------------------------------------------------

//

export class GoogleModelProvider implements ModelProvider {
    constructor(
        private client: GoogleGenerativeAI,
        private apiKey: string,
    ) {}

    /**
     * Lists all available models.
     *
     * @author Samuel Lörtscher
     */
    async listModels(): Promise<Result<string[]>> {
        try {
            // fetch a list of supported Gemini models
            const result = await fetch(
                "https://generativelanguage.googleapis.com/v1beta/" +
                    `models?key=${encodeURIComponent(this.apiKey)}`,
            );

            // a failure result has to be returned when the request failed
            if (!result.ok) {
                const body = await result.text();
                return Result.failure(
                    "Failed to fetch a list of supported Gemini models",
                    `${result.status} ${result.statusText}\n${body}`,
                );
            }

            // extract the model IDs and return them as a success result
            const json = (await result.json()) as { models?: GeminiModel[] };
            return Result.success(
                (json.models ?? []).map((model) => `google:${model.name}`),
            );
        } catch (exp: unknown) {
            // return a failure result in case of failure
            return Result.failure(
                "Failed to fetch a list of supported Gemini models",
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
            const response = await this.client
                .getGenerativeModel({
                    model: model.id,
                    systemInstruction: systemPrompt,
                })
                .generateContent(userPrompt, {
                    signal: abortSignal,
                });

            // return a refined, trimmed version of the input text
            return Result.success(response.response.text().trim());
        } catch (exp: unknown) {
            // return a failure result in case of an error
            return Result.failure(
                "failed to perform text refinement request",
                exp,
            );
        }
    }
}
