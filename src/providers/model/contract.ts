// -----------------------------------------------------------------------------
// Author:  Samuel Lörtscher
// Date:    25 January 2026
// Project: LectorGPT: LaTeX text refinement powered by OpenAI and Google
// -----------------------------------------------------------------------------

//

// import all required project modules
import { Result } from "@lectorgpt/types";
import { ModelDescriptor } from "@lectorgpt/descriptors";

//

// -----------------------------------------------------------------------------
// Exported Public Interface
// -----------------------------------------------------------------------------

//

/**
 * Parameters for refining text using a model provider.
 *
 * @author Samuel Lörtscher
 */
export type RefineTextParams = Readonly<{
    model: ModelDescriptor;
    systemPrompt: string;
    userPrompt: string;
    abortSignal: AbortSignal;
}>;

/**
 * Interface for a model provider that can list available
 * models and refine text using specified models and prompts.
 *
 * @author Samuel Lörtscher
 */
export interface ModelProvider {
    /**
     * Lists all available models.
     *
     * @author Samuel Lörtscher
     */
    listModels(): Promise<Result<string[]>>;

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
    refineText(params: RefineTextParams): Promise<Result<string>>;
}
