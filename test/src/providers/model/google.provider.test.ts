// -----------------------------------------------------------------------------
// Author:  Samuel Lörtscher
// Date:    25 January 2026
// Project: LectorGPT: LaTeX text refinement powered by OpenAI and Google
//-----------------------------------------------------------------------------

//

// import all required third party modules
import type {
    GoogleGenerativeAI,
    GenerativeModel,
    GenerateContentResult,
    EnhancedGenerateContentResponse,
} from "@google/generative-ai";
import type { SinonSandbox } from "sinon";
import expect from "expect";

// import all required project modules
import { Result } from "@lectorgpt/types";
import { ModelDescriptor } from "@lectorgpt/descriptors";
import { GoogleModelProvider } from "@lectorgpt/providers";
import { withSandbox, stub } from "@lectorgpt/testkit";

const createSucceedingClient = (
    sandbox: SinonSandbox,
    text: string,
): GoogleGenerativeAI => {
    return stub<GoogleGenerativeAI>({
        getGenerativeModel: sandbox.stub().returns(
            stub<GenerativeModel>({
                generateContent: sandbox.stub().resolves(
                    stub<GenerateContentResult>({
                        response: stub<EnhancedGenerateContentResponse>({
                            text: sandbox.stub().returns(text),
                        }),
                    }),
                ),
            }),
        ),
    });
};

const createFailingClient = (
    sandbox: SinonSandbox,
    message: string,
): GoogleGenerativeAI => {
    return stub<GoogleGenerativeAI>({
        getGenerativeModel: sandbox.stub().returns(
            stub<GenerativeModel>({
                generateContent: sandbox.stub().callsFake(async () => {
                    return Promise.reject(new Error(message));
                }),
            }),
        ),
    });
};

describe("GoogleModelProvider", () => {
    describe("listModels", () => {
        it(
            "should invoke the fetch function and return a " +
                "list of model ids",
            withSandbox(async (sandbox) => {
                // --- arrange ---
                const fetchStub = sandbox.stub(globalThis, "fetch").resolves(
                    stub<Response>({
                        ok: true,
                        json: sandbox.stub().resolves({
                            models: [
                                {
                                    name: "models/gemini-2.5-pro",
                                },
                                {
                                    name: "models/gemini-2.5-flash",
                                },
                            ],
                        }),
                    }),
                );

                // --- act ---
                const result = await new GoogleModelProvider(
                    stub<GoogleGenerativeAI>({}),
                    "google-api-key",
                ).listModels();

                // --- assert ---
                expect(result).toStrictEqual(
                    Result.success([
                        "google:models/gemini-2.5-pro",
                        "google:models/gemini-2.5-flash",
                    ]),
                );

                expect(fetchStub).toHaveBeenCalledOnceWith(
                    "https://generativelanguage.googleapis.com/" +
                        "v1beta/models?key=google-api-key",
                );
            }),
        );

        it(
            "should return an error when the result is anything but 200 ok",
            withSandbox(async (sandbox) => {
                // --- arrange ---
                sandbox.stub(globalThis, "fetch").resolves(
                    stub<Response>({
                        ok: false,
                        status: 500,
                        statusText: "Internal Server Error",
                        text: sandbox.stub().resolves("any-message"),
                    }),
                );

                // --- act ---
                const result = await new GoogleModelProvider(
                    stub<GoogleGenerativeAI>({}),
                    "google-api-key",
                ).listModels();

                // --- assert ---
                expect(result).toStrictEqual(
                    Result.failure(
                        "Failed to fetch a list of supported Gemini models",
                        new Error("500 Internal Server Error\nany-message"),
                    ),
                );
            }),
        );

        it(
            "should return an error when anything goes wrong",
            withSandbox(async (sandbox) => {
                // --- arrange ---
                sandbox.stub(globalThis, "fetch").callsFake(async () => {
                    throw new Error("any-message");
                });

                // --- act ---
                const result = await new GoogleModelProvider(
                    stub<GoogleGenerativeAI>({}),
                    "google-api-key",
                ).listModels();

                // --- assert ---
                expect(result).toStrictEqual(
                    Result.failure(
                        "Failed to fetch a list of supported Gemini models",
                        new Error("any-message"),
                    ),
                );
            }),
        );
    });

    describe("refineText", () => {
        it(
            "should invoke the appropriate methods on the Google client " +
                "and return the refined text",
            withSandbox(async (sandbox) => {
                // --- arrange ---
                const client = createSucceedingClient(
                    sandbox,
                    "refined prompt",
                );

                // --- act ---
                const result = await new GoogleModelProvider(
                    client,
                    "google-api-key",
                ).refineText({
                    model: stub<ModelDescriptor>({
                        id: "models/gemini-2.5-pro",
                    }),
                    systemPrompt: "system prompt",
                    userPrompt: "user prompt",
                    abortSignal: new AbortController().signal,
                });

                // --- assert ---
                expect(result).toStrictEqual(Result.success("refined prompt"));
                expect(client.getGenerativeModel).toHaveBeenCalledOnceWith({
                    model: "models/gemini-2.5-pro",
                    systemInstruction: "system prompt",
                });
            }),
        );

        it(
            "should trim the resulting refined text",
            withSandbox(async (sandbox) => {
                // --- arrange ---
                const client = createSucceedingClient(
                    sandbox,
                    "   refined prompt   ",
                );

                // --- act ---
                const result = await new GoogleModelProvider(
                    client,
                    "google-api-key",
                ).refineText({
                    model: stub<ModelDescriptor>({
                        id: "models/gemini-2.5-pro",
                    }),
                    systemPrompt: "system prompt",
                    userPrompt: "user prompt",
                    abortSignal: new AbortController().signal,
                });

                // --- assert ---
                expect(result).toStrictEqual(Result.success("refined prompt"));
            }),
        );

        it(
            "should return a failure when anything goes wrong",
            withSandbox(async (sandbox) => {
                // --- arrange ---
                const client = createFailingClient(sandbox, "any-message");

                // --- act ---
                const result = await new GoogleModelProvider(
                    client,
                    "google-api-key",
                ).refineText({
                    model: stub<ModelDescriptor>({
                        id: "models/gemini-2.5-pro",
                    }),
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
