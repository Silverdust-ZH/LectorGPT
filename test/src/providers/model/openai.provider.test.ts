// -----------------------------------------------------------------------------
// Author:  Samuel Lörtscher
// Date:    25 January 2026
// Project: LectorGPT: LaTeX text refinement powered by OpenAI and Google
// -----------------------------------------------------------------------------

//

// import all required third party modules
import type OpenAI from "openai";
import type { SinonSandbox } from "sinon";
import expect from "expect";

// import all required project modules
import { Result } from "@lectorgpt/types";
import { ModelDescriptor } from "@lectorgpt/descriptors";
import { OpenAIModelProvider } from "@lectorgpt/providers";
import { withSandbox, stub } from "@lectorgpt/testkit";

const createSucceedingClient = (
    sandbox: SinonSandbox,
    models: string[],
    text: string,
): OpenAI => {
    return stub<OpenAI>({
        models: stub<OpenAI.Models>({
            list: stub<() => any>(
                sandbox.stub().callsFake(async () =>
                    stub<OpenAI.ModelsPage>({
                        data: models?.map((id) =>
                            stub<OpenAI.Models.Model>({ id }),
                        ),
                    }),
                ),
            ),
        }),

        responses: stub<OpenAI.Responses>({
            create: stub<() => any>(
                sandbox.stub().callsFake(async () =>
                    stub<OpenAI.Responses.Response>({
                        output_text: text,
                    }),
                ),
            ),
        }),
    });
};

const createFailingClient = (
    sandbox: SinonSandbox,
    message: string,
): OpenAI => {
    return stub<OpenAI>({
        models: stub<OpenAI.Models>({
            list: stub<() => any>(
                sandbox
                    .stub()
                    .callsFake(async () => Promise.reject(new Error(message))),
            ),
        }),

        responses: stub<OpenAI.Responses>({
            create: stub<() => any>(async () =>
                Promise.reject(new Error(message)),
            ),
        }),
    });
};

describe("OpenAIModelProvider", () => {
    describe("listModels", () => {
        it(
            "should invoke the list function of the OpenAI client " +
                "and return a list of model ids",
            withSandbox(async (sandbox) => {
                // --- arrange ---
                const client = createSucceedingClient(
                    sandbox,
                    ["gpt-4o", "gpt-3.5-turbo"],
                    "refined prompt",
                );

                // --- act ---
                const result = await new OpenAIModelProvider(
                    client,
                ).listModels();

                // --- assert ---
                expect(result).toStrictEqual(
                    Result.success(["openai:gpt-4o", "openai:gpt-3.5-turbo"]),
                );

                expect(client.models.list).toHaveBeenCalledOnce();
            }),
        );

        it(
            "should return an error when anything goes wrong",
            withSandbox(async (sandbox) => {
                // --- arrange ---
                const client = createFailingClient(sandbox, "any-message");

                // --- act ---
                const result = await new OpenAIModelProvider(
                    client,
                ).listModels();

                // --- assert ---
                expect(result).toStrictEqual(
                    Result.failure(
                        "Failed to fetch a list of supported OpenAI models",
                        new Error("any-message"),
                    ),
                );
            }),
        );
    });

    //

    //

    describe("refineText", () => {
        it(
            "should invoke the appropriate methods on the OpenAI client " +
                "and return the refined text",
            withSandbox(async (sandbox) => {
                // --- arrange ---
                const client = createSucceedingClient(
                    sandbox,
                    ["gpt-4o", "gpt-3.5-turbo"],
                    "refined prompt",
                );

                // --- act ---
                const result = await new OpenAIModelProvider(client).refineText(
                    {
                        model: stub<ModelDescriptor>({ id: "gpt-4o" }),
                        systemPrompt: "system prompt",
                        userPrompt: "user prompt",
                        abortSignal: new AbortController().signal,
                    },
                );

                // --- assert ---
                expect(result).toStrictEqual(Result.success("refined prompt"));
                expect(client.responses.create).toHaveBeenCalledOnceWith(
                    {
                        model: "gpt-4o",
                        instructions: "system prompt",
                        input: "user prompt",
                    },
                    {
                        signal: expect.any(AbortSignal),
                    },
                );
            }),
        );

        it(
            "should trim the resulting refined text",
            withSandbox(async (sandbox) => {
                // --- arrange ---
                const client = createSucceedingClient(
                    sandbox,
                    ["gpt-4o", "gpt-3.5-turbo"],
                    "   refined prompt   ",
                );

                // --- act ---
                const result = await new OpenAIModelProvider(client).refineText(
                    {
                        model: stub<ModelDescriptor>({ id: "gpt-4o" }),
                        systemPrompt: "system prompt",
                        userPrompt: "user prompt",
                        abortSignal: new AbortController().signal,
                    },
                );

                // --- assert ---
                expect(result).toStrictEqual(Result.success("refined prompt"));
            }),
        );

        it(
            "should return a failure when anything goes wrong",
            withSandbox(async (sandbox) => {
                // --- arrange ---
                const failingOpenAIClient = createFailingClient(
                    sandbox,
                    "any-message",
                );

                // --- act ---
                const result = await new OpenAIModelProvider(
                    failingOpenAIClient,
                ).refineText({
                    model: stub<ModelDescriptor>({ id: "gpt-4o" }),
                    systemPrompt: "system prompt",
                    userPrompt: "user prompt",
                    abortSignal: new AbortController().signal,
                });

                // --- assert ---
                expect(result).toStrictEqual(
                    Result.failure(
                        "failed to perform text refinement request",
                        new Error("any-message"),
                    ),
                );
            }),
        );
    });
});
