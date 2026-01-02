// -----------------------------------------------------------------------------
// Author:  Samuel Lörtscher
// Date:    25 January 2026
// Project: LectorGPT: LaTeX text refinement powered by OpenAI and Google
// -----------------------------------------------------------------------------

//

// import all required third party modules
import * as vsc from "vscode";
import expect from "expect";

// import all required project modules
import { Result } from "@lectorgpt/types";
import { ModelDescriptor } from "@lectorgpt/descriptors";
import { InferenceService } from "@lectorgpt/services";
import { withSandbox, stub, Stubs } from "@lectorgpt/testkit";

//

// -----------------------------------------------------------------------------
// Stub Factory
// -----------------------------------------------------------------------------

//

const createTestStubs = (args: {
    sandbox: sinon.SinonSandbox;
    refineTextOnModelProviderResult: Result<string>;
}) => {
    let cancellationListener: (() => void) | undefined;
    return {
        ...Stubs.msgs(args.sandbox),
        ...Stubs.statusBarItem(args.sandbox),
        ...Stubs.abortController(args.sandbox),
        ...Stubs.modelProviders(
            args.sandbox,
            Result.success([]),
            Result.success([]),
            args.refineTextOnModelProviderResult,
        ),
        ...Stubs.withProgress(args.sandbox, (fn) => {
            cancellationListener = fn;
        }),

        triggerCancellationListener: () => cancellationListener?.(),
    };
};

//

// -----------------------------------------------------------------------------
// BDD Tests
// -----------------------------------------------------------------------------

//

describe("InferenceService", () => {
    const anySystemPrompt = "any-system-prompt";
    const anyUserPrompt = "any-user-prompt";
    const anySuccessResult = Result.success("any-response");
    const anyModel = stub<ModelDescriptor>({
        id: "openai:gpt-4o",
        name: "GPT-4o",
        vendor: "openai",
    });

    describe("refineText", () => {
        it(
            "should show a spinner and a tooltip in the status bar",
            withSandbox(async (sandbox) => {
                // --- arrange ---
                const stubs = createTestStubs({
                    sandbox,
                    refineTextOnModelProviderResult: anySuccessResult,
                });

                // --- act ---
                await InferenceService.refineText({
                    provider: stubs.providers[0],
                    model: stub<ModelDescriptor>({
                        id: "openai:gpt-4o",
                        name: "GPT-4o",
                        vendor: "openai",
                    }),
                    systemPrompt: anySystemPrompt,
                    userPrompt: anyUserPrompt,
                });

                // --- assert ---
                expect(stubs.showOnStatusBarItem).toHaveBeenCalledOnce();
                expect(stubs.statusBarItem.text).toBe("$(sync~spin) LectorGPT");
                expect(stubs.statusBarItem.tooltip).toBe(
                    "Refining selection using GPT-4o…",
                );
            }),
        );

        it(
            "should eventually dispose the status bar item",
            withSandbox(async (sandbox) => {
                // --- arrange ---
                const stubs = createTestStubs({
                    sandbox,
                    refineTextOnModelProviderResult: anySuccessResult,
                });

                // --- act ---
                await InferenceService.refineText({
                    provider: stubs.providers[0],
                    model: anyModel,
                    systemPrompt: anySystemPrompt,
                    userPrompt: anyUserPrompt,
                });

                // --- assert ---
                expect(stubs.disposeOnStatusBarItem).toHaveBeenCalledOnce();
            }),
        );

        it(
            "should show a cancelable progress notification",
            withSandbox(async (sandbox) => {
                // --- arrange ---
                const stubs = createTestStubs({
                    sandbox,
                    refineTextOnModelProviderResult: anySuccessResult,
                });

                // --- act ---
                await InferenceService.refineText({
                    provider: stubs.providers[0],
                    model: anyModel,
                    systemPrompt: anySystemPrompt,
                    userPrompt: anyUserPrompt,
                });

                // --- assert ---
                expect(stubs.withProgress).toHaveBeenCalledOnceWith(
                    {
                        location: vsc.ProgressLocation.Notification,
                        title: "LectorGPT: Refining selection using GPT-4o…",
                        cancellable: true,
                    },
                    expect.any(Function),
                );
            }),
        );

        it(
            "should invoke the provider's refineText method",
            withSandbox(async (sandbox) => {
                // --- arrange ---
                const stubs = createTestStubs({
                    sandbox,
                    refineTextOnModelProviderResult: anySuccessResult,
                });

                // --- act ---
                await InferenceService.refineText({
                    provider: stubs.providers[0],
                    model: anyModel,
                    systemPrompt: anySystemPrompt,
                    userPrompt: anyUserPrompt,
                });

                // --- assert ---
                expect(
                    stubs.refineTextOnModelProvider,
                ).toHaveBeenCalledOnceWith({
                    model: anyModel,
                    systemPrompt: anySystemPrompt,
                    userPrompt: anyUserPrompt,
                    abortSignal: { aborted: false },
                });
            }),
        );

        it(
            "should correctly wire the abort signal with the model provider",
            withSandbox(async (sandbox) => {
                // --- arrange ---
                const stubs = createTestStubs({
                    sandbox,
                    refineTextOnModelProviderResult: anySuccessResult,
                });

                // --- act ---
                await InferenceService.refineText({
                    provider: stubs.providers[0],
                    model: anyModel,
                    systemPrompt: anySystemPrompt,
                    userPrompt: anyUserPrompt,
                });

                stubs.triggerCancellationListener();

                // --- assert ---
                expect(
                    stubs.refineTextOnModelProvider,
                ).toHaveBeenCalledOnceWith({
                    model: anyModel,
                    systemPrompt: anySystemPrompt,
                    userPrompt: anyUserPrompt,
                    abortSignal: { aborted: false },
                });

                expect(stubs.abortOnAbortController).toHaveBeenCalledOnce();
            }),
        );

        it(
            "should return the result provided by the provider",
            withSandbox(async (sandbox) => {
                // --- arrange ---
                const stubs = createTestStubs({
                    sandbox,
                    refineTextOnModelProviderResult:
                        Result.success("given-response"),
                });

                // --- act ---
                const result = await InferenceService.refineText({
                    provider: stubs.providers[0],
                    model: anyModel,
                    systemPrompt: anySystemPrompt,
                    userPrompt: anyUserPrompt,
                });

                // --- assert ---
                expect(result).toBe("given-response");
            }),
        );

        it(
            "should report an error and return undefined " +
                "when an empty result was received",
            withSandbox(async (sandbox) => {
                // --- arrange ---
                const stubs = createTestStubs({
                    sandbox,
                    refineTextOnModelProviderResult: Result.success(""),
                });

                // --- act ---
                const result = await InferenceService.refineText({
                    provider: stubs.providers[0],
                    model: anyModel,
                    systemPrompt: anySystemPrompt,
                    userPrompt: anyUserPrompt,
                });

                // --- assert ---
                expect(result).toBeUndefined();
                expect(stubs.showWarnMsg).toHaveBeenCalledOnceWith(
                    "LectorGPT: Model returned empty output.",
                );
            }),
        );

        it(
            "should report an error and return undefined on any " +
                "transmission failure",
            withSandbox(async (sandbox) => {
                // --- arrange ---
                const stubs = createTestStubs({
                    sandbox,
                    refineTextOnModelProviderResult: Result.failure<string>(
                        "given-context",
                        new Error("given-error"),
                    ),
                });

                // --- act ---
                const result = await InferenceService.refineText({
                    provider: stubs.providers[0],
                    model: anyModel,
                    systemPrompt: anySystemPrompt,
                    userPrompt: anyUserPrompt,
                });

                // --- assert ---
                expect(result).toBeUndefined();
                expect(stubs.showErrorMsg).toHaveBeenCalledOnceWith(
                    "LectorGPT: given-context (Error: given-error)",
                );
            }),
        );

        it(
            "should report an error and return undefined when an " +
                "inference is started while another is still running",
            withSandbox(async (sandbox) => {
                // --- arrange ---
                const stubs = createTestStubs({
                    sandbox,
                    refineTextOnModelProviderResult: anySuccessResult,
                });

                // --- act ---
                const firstCall = InferenceService.refineText({
                    provider: stubs.providers[0],
                    model: anyModel,
                    systemPrompt: anySystemPrompt,
                    userPrompt: anyUserPrompt,
                });

                const secondCall = InferenceService.refineText({
                    provider: stubs.providers[0],
                    model: anyModel,
                    systemPrompt: anySystemPrompt,
                    userPrompt: anyUserPrompt,
                });

                await firstCall;
                const result = await secondCall;

                // --- assert ---
                expect(result).toBeUndefined();
                expect(stubs.refineTextOnModelProvider).toHaveBeenCalledOnce();
                expect(stubs.showErrorMsg).toHaveBeenCalledOnceWith(
                    "LectorGPT: An inference is already in progress. " +
                        "Please wait until it finishes.",
                );
            }),
        );

        it(
            "should be able to perform another inference " +
                "after the first one has completed",
            withSandbox(async (sandbox) => {
                // --- arrange ---
                const stubs = createTestStubs({
                    sandbox,
                    refineTextOnModelProviderResult:
                        Result.success("given-response"),
                });

                // --- act ---
                const firstResult = await InferenceService.refineText({
                    provider: stubs.providers[0],
                    model: anyModel,
                    systemPrompt: anySystemPrompt,
                    userPrompt: anyUserPrompt,
                });

                const secondResult = await InferenceService.refineText({
                    provider: stubs.providers[0],
                    model: anyModel,
                    systemPrompt: anySystemPrompt,
                    userPrompt: anyUserPrompt,
                });

                // --- assert ---
                expect(firstResult).toBe("given-response");
                expect(secondResult).toBe("given-response");
                expect(stubs.refineTextOnModelProvider).toHaveBeenCalledTwice();
                expect(stubs.showErrorMsg).not.toHaveBeenCalled();
            }),
        );
    });
});
