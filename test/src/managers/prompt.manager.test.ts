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
import { CONFIG } from "@lectorgpt/constants";
import { SourceDescriptor } from "@lectorgpt/descriptors";
import {
    PromptManager,
    SourceDescriptorQuickPickItem,
} from "@lectorgpt/managers";
import { stub, Stubs, withSandbox } from "@lectorgpt/testkit";

//

// -----------------------------------------------------------------------------
// Stub Factory
// -----------------------------------------------------------------------------

//

const createTestStubs = (args: {
    sandbox: sinon.SinonSandbox;
    workspaceFolderResult?: string | undefined;
    findFilesResult?: string[] | undefined;
    showQuickPickResult?: vsc.QuickPickItem | undefined;
    getOnConfigResult?: string | undefined;
    readFileOnFs?: sinon.SinonStub;
}) => {
    return {
        ...Stubs.context(args.sandbox),
        ...Stubs.workspaceFolder(args.sandbox, args.workspaceFolderResult),
        ...Stubs.textEditor(args.sandbox),
        ...Stubs.config(args.sandbox, args.getOnConfigResult ?? ""),
        ...Stubs.files(
            args.sandbox,
            args.findFilesResult ?? [],
            args.readFileOnFs ??
                args.sandbox.stub().resolves("any prompt content"),
        ),
        ...Stubs.quickPick(args.sandbox, args.showQuickPickResult),
        ...Stubs.msgs(args.sandbox),
    };
};

//

// -----------------------------------------------------------------------------
// BDD Tests
// -----------------------------------------------------------------------------

//

describe("PromptManager", () => {
    const anyWorkspaceFolderResult = "lectorgpt";
    const anyConfigResult = "any.prompt.md";
    const anyFindFilesResult = ["any.prompt.md"];
    const anyQuickPickResult = stub<SourceDescriptorQuickPickItem>({
        label: "any.prompt.md",
        source: SourceDescriptor.file("any.prompt.md"),
    });

    describe("selectActiveSource", () => {
        it(
            "should query the active source",
            withSandbox(async (sandbox) => {
                // --- arrange ---
                const stubs = createTestStubs({
                    sandbox,
                    getOnConfigResult: anyConfigResult,
                    findFilesResult: anyFindFilesResult,
                    showQuickPickResult: anyQuickPickResult,
                });

                // --- act ---
                await PromptManager.selectActiveSource();

                // --- assert ---
                expect(stubs.getOnConfig).toHaveBeenCalledOnceWith(
                    CONFIG.CUSTOM_SYSTEM_PROMPT_SOURCE,
                );
            }),
        );

        it(
            "should prompt the user to select one of the available sources",
            withSandbox(async (sandbox) => {
                // --- arrange ---
                const stubs = createTestStubs({
                    sandbox,
                    getOnConfigResult: "",
                    findFilesResult: ["given.prompt.md"],
                    showQuickPickResult: anyQuickPickResult,
                });

                // --- act ---
                await PromptManager.selectActiveSource();

                // --- assert ---
                expect(stubs.showQuickPick).toHaveBeenCalledOnceWith(
                    [
                        {
                            label: "✓  <default>",
                            source: SourceDescriptor.asset(),
                        },
                        {
                            label: "given.prompt.md",
                            source: SourceDescriptor.file("given.prompt.md"),
                        },
                    ],
                    {
                        title: "System Prompt Source",
                        placeHolder:
                            "Select the system prompt source to be used",
                        ignoreFocusOut: true,
                    },
                );
            }),
        );

        it(
            "should mark the active source",
            withSandbox(async (sandbox) => {
                // --- arrange ---
                const stubs = createTestStubs({
                    sandbox,
                    getOnConfigResult: "given.prompt.md",
                    findFilesResult: ["given.prompt.md"],
                    showQuickPickResult: anyQuickPickResult,
                });

                // --- act ---
                await PromptManager.selectActiveSource();

                // --- assert ---
                expect(stubs.showQuickPick).toHaveBeenCalledOnceWith(
                    [
                        {
                            label: "<default>",
                            source: SourceDescriptor.asset(),
                        },
                        {
                            label: "✓  given.prompt.md",
                            source: SourceDescriptor.file("given.prompt.md"),
                        },
                    ],
                    {
                        title: "System Prompt Source",
                        placeHolder:
                            "Select the system prompt source to be used",
                        ignoreFocusOut: true,
                    },
                );
            }),
        );

        it(
            "should persist and return the selected file source " +
                "when it differs from the active one",
            withSandbox(async (sandbox) => {
                // --- arrange ---
                const source = SourceDescriptor.file("given.prompt.md");
                const stubs = createTestStubs({
                    sandbox,
                    getOnConfigResult: "",
                    findFilesResult: ["given.prompt.md"],
                    showQuickPickResult: stub<SourceDescriptorQuickPickItem>({
                        label: "given.prompt.md",
                        source,
                    }),
                });

                // --- act ---
                const result = await PromptManager.selectActiveSource();

                // --- assert ---
                expect(result).toBe(source);
                expect(stubs.updateOnConfig).toHaveBeenCalledOnceWith(
                    CONFIG.CUSTOM_SYSTEM_PROMPT_SOURCE,
                    "given.prompt.md",
                    vsc.ConfigurationTarget.Workspace,
                );

                expect(stubs.showErrorMsg).not.toHaveBeenCalled();
                expect(stubs.showInfoMsg).toHaveBeenCalledWith(
                    "LectorGPT: Successfully selected the custom " +
                        'system prompt "given.prompt.md".',
                );
            }),
        );

        it(
            "should persist and return the selected asset source " +
                "when it differs from the active one",
            withSandbox(async (sandbox) => {
                // --- arrange ---
                const source = SourceDescriptor.asset();
                const stubs = createTestStubs({
                    sandbox,
                    getOnConfigResult: "given.prompt.md",
                    findFilesResult: ["given.prompt.md"],
                    showQuickPickResult: stub<SourceDescriptorQuickPickItem>({
                        label: "<default>",
                        source,
                    }),
                });

                // --- act ---
                const result = await PromptManager.selectActiveSource();

                // --- assert ---
                expect(result).toBe(source);
                expect(stubs.updateOnConfig).toHaveBeenCalledOnceWith(
                    CONFIG.CUSTOM_SYSTEM_PROMPT_SOURCE,
                    undefined,
                    vsc.ConfigurationTarget.Workspace,
                );

                expect(stubs.showErrorMsg).not.toHaveBeenCalled();
                expect(stubs.showInfoMsg).toHaveBeenCalledWith(
                    "LectorGPT: Successfully selected the default " +
                        "system prompt.",
                );
            }),
        );

        it(
            "should return but not persist the selected " +
                "source when it has not changed",
            withSandbox(async (sandbox) => {
                // --- arrange ---
                const source = SourceDescriptor.file("given.prompt.md");
                const stubs = createTestStubs({
                    sandbox,
                    getOnConfigResult: "given.prompt.md",
                    findFilesResult: ["given.prompt.md"],
                    showQuickPickResult: stub<SourceDescriptorQuickPickItem>({
                        label: "given.prompt.md",
                        source,
                    }),
                });

                // --- act ---
                const result = await PromptManager.selectActiveSource();

                // --- assert ---
                expect(result).toBe(source);
                expect(stubs.updateOnConfig).not.toHaveBeenCalled();
                expect(stubs.showInfoMsg).not.toHaveBeenCalled();
                expect(stubs.showErrorMsg).not.toHaveBeenCalled();
            }),
        );

        it(
            "should return undefined when the selection process was canceled",
            withSandbox(async (sandbox) => {
                // --- arrange --
                const stubs = createTestStubs({
                    sandbox,
                    getOnConfigResult: anyConfigResult,
                    findFilesResult: anyFindFilesResult,
                    showQuickPickResult: undefined,
                });

                // --- act ---
                const result = await PromptManager.selectActiveSource();

                // --- assert ---
                expect(result).toBeUndefined();
                expect(stubs.updateOnConfig).not.toHaveBeenCalled();
                expect(stubs.showInfoMsg).not.toHaveBeenCalled();
                expect(stubs.showErrorMsg).not.toHaveBeenCalled();
            }),
        );
    });

    //

    //

    describe("resolveActiveSource", () => {
        it(
            "should query the active source",
            withSandbox(async (sandbox) => {
                // --- arrange ---
                const stubs = createTestStubs({
                    sandbox,
                    getOnConfigResult: anyConfigResult,
                    findFilesResult: anyFindFilesResult,
                    showQuickPickResult: anyQuickPickResult,
                });

                // --- act ---
                await PromptManager.resolveActiveSource();

                // --- assert ---
                expect(stubs.getOnConfig).toHaveBeenCalledOnceWith(
                    CONFIG.CUSTOM_SYSTEM_PROMPT_SOURCE,
                );
            }),
        );

        it(
            "should return the active file source when any such was defined",
            withSandbox(async (sandbox) => {
                // --- arrange ---
                const stubs = createTestStubs({
                    sandbox,
                    getOnConfigResult: "given.prompt.md",
                });

                // --- act ---
                const result = await PromptManager.resolveActiveSource();

                // --- assert ---
                expect(result).toStrictEqual(
                    SourceDescriptor.file("given.prompt.md"),
                );

                expect(stubs.showQuickPick).not.toHaveBeenCalled();
                expect(stubs.updateOnConfig).not.toHaveBeenCalled();
                expect(stubs.showInfoMsg).not.toHaveBeenCalled();
                expect(stubs.showErrorMsg).not.toHaveBeenCalled();
            }),
        );

        it(
            "should return the asset source when no active " +
                "file source was defined",
            withSandbox(async (sandbox) => {
                // --- arrange ---
                const stubs = createTestStubs({
                    sandbox,
                    getOnConfigResult: "",
                });

                // --- act ---
                const result = await PromptManager.resolveActiveSource();

                // --- assert ---
                expect(result).toStrictEqual(SourceDescriptor.asset());
                expect(stubs.showQuickPick).not.toHaveBeenCalled();
                expect(stubs.updateOnConfig).not.toHaveBeenCalled();
                expect(stubs.showInfoMsg).not.toHaveBeenCalled();
                expect(stubs.showErrorMsg).not.toHaveBeenCalled();
            }),
        );
    });

    //

    //

    describe("loadSystemPrompt", () => {
        it(
            "should read and return the content of the active file source",
            withSandbox(async (sandbox) => {
                // --- arrange ---
                const source = SourceDescriptor.file("given.prompt.md");
                const stubs = createTestStubs({
                    sandbox,
                    workspaceFolderResult: anyWorkspaceFolderResult,
                    getOnConfigResult: anyConfigResult,
                });

                // --- act ---
                const result = await PromptManager.loadActiveSystemPrompt(
                    stubs.context,
                    source,
                );

                // --- assert ---
                expect(result).toBe("any prompt content");
            }),
        );

        it(
            "should report an error and return undefined " +
                "when no workspace is available",
            withSandbox(async (sandbox) => {
                // --- arrange ---
                const stubs = createTestStubs({
                    sandbox,
                    workspaceFolderResult: undefined,
                });

                // --- act ---
                const result = await PromptManager.loadActiveSystemPrompt(
                    stubs.context,
                    SourceDescriptor.file("given.prompt.md"),
                );

                // --- assert ---
                expect(result).toBeUndefined();
                expect(stubs.showErrorMsg).toHaveBeenCalledWith(
                    "LectorGPT: No active workspace folder found.",
                );
            }),
        );

        it(
            "should report an error and return undefined " +
                "when the selected system prompt file cannot be read",
            withSandbox(async (sandbox) => {
                // --- arrange ---
                const stubs = createTestStubs({
                    sandbox,
                    workspaceFolderResult: anyWorkspaceFolderResult,
                    getOnConfigResult: anyConfigResult,
                    readFileOnFs: sandbox
                        .stub()
                        .rejects(new Error("given error")),
                });

                // --- act ---
                const result = await PromptManager.loadActiveSystemPrompt(
                    stubs.context,
                    SourceDescriptor.file("given.prompt.md"),
                );

                // --- assert ---
                expect(result).toBeUndefined();
                expect(stubs.showErrorMsg).toHaveBeenCalledWith(
                    "LectorGPT: Failed to read the custom system prompt file " +
                        'at "/lectorgpt/given.prompt.md" (Error: given error)',
                );
            }),
        );

        it(
            "should report an error and return undefined " +
                "when the selected system prompt asset cannot be read",
            withSandbox(async (sandbox) => {
                // --- arrange ---
                const stubs = createTestStubs({
                    sandbox,
                    workspaceFolderResult: anyWorkspaceFolderResult,
                    getOnConfigResult: anyConfigResult,
                    readFileOnFs: sandbox
                        .stub()
                        .rejects(new Error("given error")),
                });

                // --- act ---
                const result = await PromptManager.loadActiveSystemPrompt(
                    stubs.context,
                    SourceDescriptor.asset(),
                );

                // --- assert ---
                expect(result).toBeUndefined();
                expect(stubs.showErrorMsg).toHaveBeenCalledWith(
                    "LectorGPT: Failed to read the default system prompt " +
                        "(Error: given error)",
                );
            }),
        );
    });
});
