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
import { ModelDescriptor } from "@lectorgpt/descriptors";
import { EditorService } from "@lectorgpt/services";
import { withSandbox, stub, Stubs } from "@lectorgpt/testkit";

//

// -----------------------------------------------------------------------------
// Stub Factory
// -----------------------------------------------------------------------------

//

const createTestStubs = (args: {
    sandbox: sinon.SinonSandbox;
    getTextOnDocumentResult?: string | undefined;
    getOnConfigResult?: number;
    editOnEditorResult?: boolean;
}) => {
    return {
        ...Stubs.msgs(args.sandbox),
        ...Stubs.config(args.sandbox, [args.getOnConfigResult]),
        ...Stubs.textEditor(
            args.sandbox,
            args.getTextOnDocumentResult,
            args.editOnEditorResult,
        ),
    };
};

//

// -----------------------------------------------------------------------------
// BDD Tests
// -----------------------------------------------------------------------------

//

describe("Editor ", () => {
    const anyText = "any-text";
    const anySuggestion = "any-suggestion";
    const anyModel = stub<ModelDescriptor>({
        id: "openai:gpt-4o",
        name: "GPT-4o",
        vendor: "openai",
    });

    describe("getCurrentSelection", () => {
        it(
            "should return the selection",
            withSandbox(async (sandbox) => {
                // --- arrange ---
                const stubs = createTestStubs({
                    sandbox,
                    getTextOnDocumentResult: anyText,
                });

                // --- act ---
                const result = await EditorService.getCurrentSelection(
                    vsc.window.activeTextEditor!,
                );

                // --- assert ---
                expect(result).toBe(stubs.selection);
                expect(stubs.getTextOnDocument).toHaveBeenCalledOnce();
            }),
        );

        it(
            "should report a warning and return undefined " +
                "when the selection is empty",
            withSandbox(async (sandbox) => {
                // --- arrange ---
                const stubs = createTestStubs({
                    sandbox,
                    getTextOnDocumentResult: "",
                });

                // --- act ---
                const result = await EditorService.getCurrentSelection(
                    vsc.window.activeTextEditor!,
                );

                // --- assert ---
                expect(result).toBeUndefined();
                expect(stubs.showWarnMsg).toHaveBeenCalledOnceWith(
                    "LectorGPT: No text selected.",
                );
            }),
        );

        it(
            "should treat a selection consisting solely " +
                "of whitespaces as empty",
            withSandbox(async (sandbox) => {
                // ---- arrange ---
                const stubs = createTestStubs({
                    sandbox,
                    getTextOnDocumentResult: "    ",
                });

                // --- act ---
                const result = await EditorService.getCurrentSelection(
                    vsc.window.activeTextEditor!,
                );

                // --- assert ---
                expect(result).toBeUndefined();
                expect(stubs.showWarnMsg).toHaveBeenCalledOnceWith(
                    "LectorGPT: No text selected.",
                );
            }),
        );
    });

    //

    //

    describe("insertSuggestion", () => {
        it(
            "should insert all headers as well as the suggestion",
            withSandbox(async (sandbox) => {
                // --- arrange ---
                const stubs = createTestStubs({
                    sandbox,
                    editOnEditorResult: true,
                    getOnConfigResult: 30,
                });

                // --- act ---
                await EditorService.insertSuggestion(
                    vsc.window.activeTextEditor!,
                    anySuggestion,
                    anyModel,
                );

                // --- assert ---
                expect(stubs.insertOnEditorEdit).toHaveBeenNthCalledWith(
                    0,
                    { character: 7 },
                    "\n\n% ------- % ORIGINAL % -------\n",
                );

                expect(stubs.insertOnEditorEdit).toHaveBeenNthCalledWith(
                    1,
                    { character: 42 },
                    "\n\n% -- % SUGGESTION (GPT-4o) % -\n",
                );

                expect(stubs.insertOnEditorEdit).toHaveBeenNthCalledWith(
                    2,
                    { character: 42 },
                    "any-suggestion",
                );
            }),
        );

        it(
            "should report an error when the suggestion cannot be appended",
            withSandbox(async (sandbox) => {
                // --- arrange ---
                const stubs = createTestStubs({
                    sandbox,
                    editOnEditorResult: false,
                    getOnConfigResult: 30,
                });

                // --- act ---
                await EditorService.insertSuggestion(
                    vsc.window.activeTextEditor!,
                    anySuggestion,
                    anyModel,
                );

                // --- assert ---
                expect(stubs.showErrorMsg).toHaveBeenCalledOnceWith(
                    "LectorGPT: Unable to insert suggestion.",
                );
            }),
        );
    });
});
