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
import { Result, Vendor, Vendors } from "@lectorgpt/types";
import { VendorDescriptor, ModelDescriptor } from "@lectorgpt/descriptors";
import {
    ModelManager,
    ModelDescriptorQuickPickItem,
} from "@lectorgpt/managers";
import { withSandbox, stub, Stubs } from "@lectorgpt/testkit";
import Sinon from "sinon";

//

// -----------------------------------------------------------------------------
// Stub Factory
// -----------------------------------------------------------------------------

//

const createTestStubs = (args: {
    sandbox: sinon.SinonSandbox;
    readFileOnFsResult: sinon.SinonStub;
    openAiModelsResult: Result<string[]>;
    googleModelsResult: Result<string[]>;
    showQuickPickResult?: vsc.QuickPickItem | undefined;
    getOnConfigResult?: string | undefined;
}) => {
    return {
        ...Stubs.files(args.sandbox, [], args.readFileOnFsResult),
        ...Stubs.msgs(args.sandbox),
        ...Stubs.config(args.sandbox, args.getOnConfigResult ?? ""),
        ...Stubs.context(args.sandbox),
        ...Stubs.quickPick(args.sandbox, args.showQuickPickResult),
        ...Stubs.modelProviders(
            args.sandbox,
            args.openAiModelsResult,
            args.googleModelsResult,
            Result.success(""),
        ),
    };
};

//

// -----------------------------------------------------------------------------
// BDD Tests
// -----------------------------------------------------------------------------

//

describe("ModelManager", () => {
    const openai = {
        vendor: "openai",
        id: "gpt-4o",
        name: "GPT-4o",
        hint: "gpt-hint",
        order: 1,
    } satisfies ModelDescriptor;

    const gemini = {
        vendor: "google",
        id: "models/gemini-2.5-pro",
        name: "Gemini 2.5 Pro",
        hint: "gemini-hint",
        order: 1,
    } satisfies ModelDescriptor;

    const anyCuratedModelCatalogResult = (sandbox: Sinon.SinonSandbox) =>
        sandbox.stub().resolves(JSON.stringify([openai, gemini]));

    const anyConfigResult = "gpt-4o";
    const anyQuickPickResult = stub<ModelDescriptorQuickPickItem>({
        label: "gpt-4o",
        model: stub<ModelDescriptor>({
            id: "gpt-4o",
            name: "GPT-4o",
            vendor: "openai",
        }),
    });

    const anyOpenAiModelsResult = Result.success(["openai:gpt-4o"]);
    const anyGoogleModelsResult = Result.success([
        "google:models/gemini-2.5-pro",
    ]);

    describe("selectActiveModel", () => {
        it(
            "should load the curated model catalog",
            withSandbox(async (sandbox) => {
                // --- arrange ---
                const stubs = createTestStubs({
                    sandbox,
                    readFileOnFsResult: anyCuratedModelCatalogResult(sandbox),
                    openAiModelsResult: anyOpenAiModelsResult,
                    googleModelsResult: anyGoogleModelsResult,
                    getOnConfigResult: anyConfigResult,
                    showQuickPickResult: anyQuickPickResult,
                });

                // --- act ---
                await ModelManager.selectActiveModel(
                    stubs.context,
                    VendorDescriptor.create(Vendors.all()),
                    stubs.providers,
                );

                // --- assert ---
                expect(stubs.readFileOnFs).toHaveBeenCalledOnceWith({
                    path: "/lectorgpt/assets/models/curated.json",
                });
            }),
        );

        it(
            "should return an error and return undefined " +
                "when the curated model catalog cannot be loaded",
            withSandbox(async (sandbox) => {
                // --- arrange ---
                const stubs = createTestStubs({
                    sandbox,
                    readFileOnFsResult: sandbox
                        .stub()
                        .rejects(new Error("given-error-msg")),
                    openAiModelsResult: anyOpenAiModelsResult,
                    googleModelsResult: anyGoogleModelsResult,
                    getOnConfigResult: anyConfigResult,
                    showQuickPickResult: anyQuickPickResult,
                });

                // --- act ---
                const result = await ModelManager.selectActiveModel(
                    stubs.context,
                    VendorDescriptor.create(Vendors.all()),
                    stubs.providers,
                );

                // --- assert ---
                expect(result).toBeUndefined();
                expect(stubs.showErrorMsg).toHaveBeenCalledOnceWith(
                    "Failed to load the curated model catalog. " +
                        "Please reinstall the extension or contact support. " +
                        "(Error: given-error-msg)",
                );
            }),
        );

        it(
            "should query a list of supported models from each provider",
            withSandbox(async (sandbox) => {
                // --- arrange ---
                const stubs = createTestStubs({
                    sandbox,
                    readFileOnFsResult: anyCuratedModelCatalogResult(sandbox),
                    openAiModelsResult: anyOpenAiModelsResult,
                    googleModelsResult: anyGoogleModelsResult,
                    getOnConfigResult: anyConfigResult,
                    showQuickPickResult: anyQuickPickResult,
                });

                // --- act ---
                await ModelManager.selectActiveModel(
                    stubs.context,
                    VendorDescriptor.create(Vendors.all()),
                    stubs.providers,
                );

                // --- assert ---
                expect(stubs.listModelsOnGoogleProvider).toHaveBeenCalledOnce();
                expect(stubs.listModelsOnOpenAIProvider).toHaveBeenCalledOnce();
            }),
        );

        it(
            "should report an error and return undefined " +
                "when an error occurred while querying any of the providers",
            withSandbox(async (sandbox) => {
                // --- arrange ---
                const stubs = createTestStubs({
                    sandbox,
                    readFileOnFsResult: anyCuratedModelCatalogResult(sandbox),
                    openAiModelsResult: anyOpenAiModelsResult,
                    googleModelsResult: Result.failure(
                        "provider-error",
                        "given-error-msg",
                    ),
                    getOnConfigResult: anyConfigResult,
                    showQuickPickResult: anyQuickPickResult,
                });

                // --- act ---
                const result = await ModelManager.selectActiveModel(
                    stubs.context,
                    VendorDescriptor.create(Vendors.all()),
                    stubs.providers,
                );

                // --- assert ---
                expect(result).toBeUndefined();
                expect(stubs.showErrorMsg).toHaveBeenCalledOnceWith(
                    "LectorGPT: provider-error (Error: given-error-msg)",
                );
            }),
        );

        it(
            "should query the active model",
            withSandbox(async (sandbox) => {
                // --- arrange ---
                const stubs = createTestStubs({
                    sandbox,
                    readFileOnFsResult: anyCuratedModelCatalogResult(sandbox),
                    openAiModelsResult: anyOpenAiModelsResult,
                    googleModelsResult: anyGoogleModelsResult,
                    getOnConfigResult: anyConfigResult,
                    showQuickPickResult: anyQuickPickResult,
                });

                // --- act ---
                await ModelManager.selectActiveModel(
                    stubs.context,
                    VendorDescriptor.create(Vendors.all()),
                    stubs.providers,
                );

                // --- assert ---
                expect(stubs.getOnConfig).toHaveBeenCalledOnceWith(
                    CONFIG.MODEL,
                );
            }),
        );

        it(
            "should prompt the user to select a new model",
            withSandbox(async (sandbox) => {
                // --- arrange ---
                const stubs = createTestStubs({
                    sandbox,
                    readFileOnFsResult: sandbox
                        .stub()
                        .resolves(JSON.stringify([openai, gemini])),
                    openAiModelsResult: Result.success(["openai:gpt-4o"]),
                    googleModelsResult: Result.success([
                        "google:models/gemini-2.5-pro",
                    ]),
                    getOnConfigResult: anyConfigResult,
                    showQuickPickResult: anyQuickPickResult,
                });

                // --- act ---
                await ModelManager.selectActiveModel(
                    stubs.context,
                    VendorDescriptor.create(Vendors.all()),
                    stubs.providers,
                );

                // --- assert ---
                expect(stubs.showQuickPick).toHaveBeenCalledOnceWith(
                    [
                        {
                            kind: vsc.QuickPickItemKind.Separator,
                            label: "OpenAI API",
                        },
                        {
                            kind: vsc.QuickPickItemKind.Default,
                            label: "GPT-4o",
                            description: "gpt-hint",
                            model: openai,
                        },
                        {
                            kind: vsc.QuickPickItemKind.Separator,
                            label: "Google API",
                        },
                        {
                            kind: vsc.QuickPickItemKind.Default,
                            label: "Gemini 2.5 Pro",
                            description: "gemini-hint",
                            model: gemini,
                        },
                    ],
                    {
                        title: "LLM Model Selection",
                        placeHolder: "Select which model to use",
                        ignoreFocusOut: true,
                    },
                );
            }),
        );

        it(
            "should only present models that are defined in the " +
                "curated model catalog",
            withSandbox(async (sandbox) => {
                // --- arrange ---
                const stubs = createTestStubs({
                    sandbox,
                    readFileOnFsResult: sandbox
                        .stub()
                        .resolves(JSON.stringify([openai])),
                    openAiModelsResult: Result.success(["openai:gpt-4o"]),
                    googleModelsResult: Result.success([
                        "google:models/gemini-2.5-pro",
                    ]),
                    getOnConfigResult: anyConfigResult,
                    showQuickPickResult: anyQuickPickResult,
                });

                // --- act ---
                await ModelManager.selectActiveModel(
                    stubs.context,
                    VendorDescriptor.create(Vendors.all()),
                    stubs.providers,
                );

                // --- assert ---
                expect(stubs.showQuickPick).toHaveBeenCalledOnceWith(
                    [
                        {
                            kind: vsc.QuickPickItemKind.Separator,
                            label: "OpenAI API",
                        },
                        {
                            kind: vsc.QuickPickItemKind.Default,
                            label: "GPT-4o",
                            description: "gpt-hint",
                            model: openai,
                        },
                    ],
                    {
                        title: "LLM Model Selection",
                        placeHolder: "Select which model to use",
                        ignoreFocusOut: true,
                    },
                );
            }),
        );

        it(
            "should report an error and return undefined when there is no" +
                "overlap between the set of supported models and the " +
                "curated model catalog",
            withSandbox(async (sandbox) => {
                // --- arrange ---
                const stubs = createTestStubs({
                    sandbox,
                    readFileOnFsResult: sandbox
                        .stub()
                        .resolves(JSON.stringify([openai])),
                    openAiModelsResult: Result.success([]),
                    googleModelsResult: Result.success([
                        "google:models/gemini-2.5-pro",
                    ]),
                    getOnConfigResult: anyConfigResult,
                    showQuickPickResult: anyQuickPickResult,
                });

                // --- act ---
                const result = await ModelManager.selectActiveModel(
                    stubs.context,
                    VendorDescriptor.create(Vendors.all()),
                    stubs.providers,
                );

                // --- assert ---
                expect(result).toBeUndefined();
                expect(stubs.showQuickPick).not.toHaveBeenCalled();
                expect(stubs.showErrorMsg).toHaveBeenCalledOnceWith(
                    "LectorGPT: No supported models are available. " +
                        "Please check your configuration or contact support.",
                );
            }),
        );

        it(
            "should mark the active model",
            withSandbox(async (sandbox) => {
                // --- arrange ---
                const stubs = createTestStubs({
                    sandbox,
                    readFileOnFsResult: sandbox
                        .stub()
                        .resolves(JSON.stringify([openai, gemini])),
                    openAiModelsResult: Result.success(["openai:gpt-4o"]),
                    googleModelsResult: Result.success([
                        "google:models/gemini-2.5-pro",
                    ]),
                    getOnConfigResult: "openai:gpt-4o",
                    showQuickPickResult: anyQuickPickResult,
                });

                // --- act ---
                await ModelManager.selectActiveModel(
                    stubs.context,
                    VendorDescriptor.create(Vendors.all()),
                    stubs.providers,
                );

                // --- assert ---
                expect(stubs.showQuickPick).toHaveBeenCalledOnceWith(
                    [
                        {
                            kind: vsc.QuickPickItemKind.Separator,
                            label: "OpenAI API",
                        },
                        {
                            kind: vsc.QuickPickItemKind.Default,
                            label: "✓  GPT-4o",
                            description: "gpt-hint",
                            model: openai,
                        },
                        {
                            kind: vsc.QuickPickItemKind.Separator,
                            label: "Google API",
                        },
                        {
                            kind: vsc.QuickPickItemKind.Default,
                            label: "Gemini 2.5 Pro",
                            description: "gemini-hint",
                            model: gemini,
                        },
                    ],
                    {
                        title: "LLM Model Selection",
                        placeHolder: "Select which model to use",
                        ignoreFocusOut: true,
                    },
                );
            }),
        );

        it(
            "should ignore the case where the active model " +
                "is no longer supported",
            withSandbox(async (sandbox) => {
                // --- arrange ---
                const stubs = createTestStubs({
                    sandbox,
                    readFileOnFsResult: sandbox
                        .stub()
                        .resolves(JSON.stringify([openai])),
                    openAiModelsResult: Result.success(["openai:gpt-4o"]),
                    googleModelsResult: Result.success([
                        "google:models/gemini-2.5-pro",
                    ]),
                    getOnConfigResult: "google:models/gemini-2.5-pro",
                    showQuickPickResult: anyQuickPickResult,
                });

                // --- act ---
                await ModelManager.selectActiveModel(
                    stubs.context,
                    VendorDescriptor.create(Vendors.all()),
                    stubs.providers,
                );

                // --- assert ---
                expect(stubs.showWarnMsg).not.toHaveBeenCalled();
            }),
        );

        it(
            "should ignore the case where the active model is from a vendor " +
                "which is not part of the active vendor setup",
            withSandbox(async (sandbox) => {
                // --- arrange ---
                const stubs = createTestStubs({
                    sandbox,
                    readFileOnFsResult: sandbox
                        .stub()
                        .resolves(JSON.stringify([openai, gemini])),
                    openAiModelsResult: Result.success(["openai:gpt-4o"]),
                    googleModelsResult: Result.success([
                        "google:models/gemini-2.5-pro",
                    ]),
                    getOnConfigResult: "google:models/gemini-2.5-pro",
                    showQuickPickResult: anyQuickPickResult,
                });

                // --- act ---
                await ModelManager.selectActiveModel(
                    stubs.context,
                    VendorDescriptor.create(["openai"]),
                    stubs.providers,
                );

                // --- assert ---
                expect(stubs.showWarnMsg).not.toHaveBeenCalled();
            }),
        );

        it(
            "should persist and return the selected model " +
                "when it differs from the active one",
            withSandbox(async (sandbox) => {
                // --- arrange ---
                const stubs = createTestStubs({
                    sandbox,
                    readFileOnFsResult: anyCuratedModelCatalogResult(sandbox),
                    openAiModelsResult: anyOpenAiModelsResult,
                    googleModelsResult: anyGoogleModelsResult,
                    getOnConfigResult: undefined,
                    showQuickPickResult: stub<ModelDescriptorQuickPickItem>({
                        kind: vsc.QuickPickItemKind.Default,
                        label: "GPT-4o",
                        model: openai,
                    }),
                });

                // --- act ---
                const result = await ModelManager.selectActiveModel(
                    stubs.context,
                    VendorDescriptor.create(Vendors.all()),
                    stubs.providers,
                );

                // --- assert ---
                expect(result).toStrictEqual(openai);

                expect(stubs.updateOnConfig).toHaveBeenCalledOnceWith(
                    CONFIG.MODEL,
                    "openai:gpt-4o",
                    vsc.ConfigurationTarget.Workspace,
                );

                expect(stubs.showErrorMsg).not.toHaveBeenCalled();
                expect(stubs.showInfoMsg).toHaveBeenCalledOnceWith(
                    'LectorGPT: Successfully selected model "GPT-4o".',
                );
            }),
        );

        it(
            "should return but not persist the selected " +
                "model when it has not changed",
            withSandbox(async (sandbox) => {
                // --- arrange ---
                const stubs = createTestStubs({
                    sandbox,
                    readFileOnFsResult: anyCuratedModelCatalogResult(sandbox),
                    openAiModelsResult: anyOpenAiModelsResult,
                    googleModelsResult: anyGoogleModelsResult,
                    getOnConfigResult: "openai:gpt-4o",
                    showQuickPickResult: stub<ModelDescriptorQuickPickItem>({
                        kind: vsc.QuickPickItemKind.Default,
                        label: "GPT-4o",
                        model: openai,
                    }),
                });

                // --- act ---
                const result = await ModelManager.selectActiveModel(
                    stubs.context,
                    VendorDescriptor.create(Vendors.all()),
                    stubs.providers,
                );

                // --- assert ---
                expect(result).toStrictEqual(openai);

                expect(stubs.updateOnConfig).not.toHaveBeenCalled();
                expect(stubs.showInfoMsg).not.toHaveBeenCalled();
                expect(stubs.showErrorMsg).not.toHaveBeenCalled();
            }),
        );

        it(
            "should return undefined when the selection process was canceled",
            withSandbox(async (sandbox) => {
                // --- arrange ---
                const stubs = createTestStubs({
                    sandbox,
                    readFileOnFsResult: anyCuratedModelCatalogResult(sandbox),
                    openAiModelsResult: anyOpenAiModelsResult,
                    googleModelsResult: anyGoogleModelsResult,
                    getOnConfigResult: "openai:gpt-4o",
                    showQuickPickResult: undefined,
                });

                // --- act ---
                const result = await ModelManager.selectActiveModel(
                    stubs.context,
                    VendorDescriptor.create(Vendors.all()),
                    stubs.providers,
                );

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

    describe("resolveActiveModel", () => {
        it(
            "should query the active model",
            withSandbox(async (sandbox) => {
                // --- arrange ---
                const stubs = createTestStubs({
                    sandbox,
                    readFileOnFsResult: anyCuratedModelCatalogResult(sandbox),
                    openAiModelsResult: anyOpenAiModelsResult,
                    googleModelsResult: anyGoogleModelsResult,
                    getOnConfigResult: "openai:gpt-4o",
                    showQuickPickResult: anyQuickPickResult,
                });

                // --- act ---
                await ModelManager.resolveActiveModel(
                    stubs.context,
                    VendorDescriptor.create(Vendors.all()),
                    stubs.providers,
                    "any-cmd",
                );

                // --- assert ---
                expect(stubs.getOnConfig).toHaveBeenCalledOnceWith(
                    CONFIG.MODEL,
                );
            }),
        );

        it(
            "should return an error and return undefined " +
                "when the curated model catalog cannot be loaded",
            withSandbox(async (sandbox) => {
                // --- arrange ---
                const stubs = createTestStubs({
                    sandbox,
                    readFileOnFsResult: sandbox
                        .stub()
                        .rejects(new Error("given-error-msg")),
                    openAiModelsResult: anyOpenAiModelsResult,
                    googleModelsResult: anyGoogleModelsResult,
                    getOnConfigResult: anyConfigResult,
                    showQuickPickResult: anyQuickPickResult,
                });

                // --- act ---
                const result = await ModelManager.resolveActiveModel(
                    stubs.context,
                    VendorDescriptor.create(Vendors.all()),
                    stubs.providers,
                    "any-cmd",
                );

                // --- assert ---
                expect(result).toBeUndefined();
                expect(stubs.showErrorMsg).toHaveBeenCalledOnceWith(
                    "Failed to load the curated model catalog. " +
                        "Please reinstall the extension or contact support. " +
                        "(Error: given-error-msg)",
                );
            }),
        );

        it(
            "should return the active model without " +
                "interaction when an active model exists",
            withSandbox(async (sandbox) => {
                // --- arrange ---
                const stubs = createTestStubs({
                    sandbox,
                    readFileOnFsResult: sandbox
                        .stub()
                        .resolves(JSON.stringify([openai])),
                    openAiModelsResult: Result.success(["openai:gpt-4o"]),
                    googleModelsResult: Result.success([]),
                    getOnConfigResult: "openai:gpt-4o",
                    showQuickPickResult: anyQuickPickResult,
                });

                // --- act ---
                const result = await ModelManager.resolveActiveModel(
                    stubs.context,
                    VendorDescriptor.create(Vendors.all()),
                    stubs.providers,
                    "any-cmd",
                );

                // --- assert ---
                expect(result).toStrictEqual(openai);
                expect(stubs.showQuickPick).not.toHaveBeenCalled();
                expect(stubs.updateOnConfig).not.toHaveBeenCalled();
                expect(stubs.showInfoMsg).not.toHaveBeenCalled();
                expect(stubs.showErrorMsg).not.toHaveBeenCalled();
            }),
        );

        it(
            "should prompt the user to select a new model ad hoc " +
                "when no active model exists",
            withSandbox(async (sandbox) => {
                // --- arrange ---
                const stubs = createTestStubs({
                    sandbox,
                    readFileOnFsResult: sandbox
                        .stub()
                        .resolves(JSON.stringify([openai, gemini])),
                    openAiModelsResult: Result.success(["openai:gpt-4o"]),
                    googleModelsResult: Result.success([
                        "google:models/gemini-2.5-pro",
                    ]),
                    getOnConfigResult: "",
                    showQuickPickResult: anyQuickPickResult,
                });

                // --- act ---
                await ModelManager.resolveActiveModel(
                    stubs.context,
                    VendorDescriptor.create(Vendors.all()),
                    stubs.providers,
                    "any-cmd",
                );

                // --- assert ---
                expect(stubs.showQuickPick).toHaveBeenCalledOnceWith(
                    [
                        {
                            kind: vsc.QuickPickItemKind.Separator,
                            label: "OpenAI API",
                        },
                        {
                            kind: vsc.QuickPickItemKind.Default,
                            label: "GPT-4o",
                            description: "gpt-hint",
                            model: openai,
                        },
                        {
                            kind: vsc.QuickPickItemKind.Separator,
                            label: "Google API",
                        },
                        {
                            kind: vsc.QuickPickItemKind.Default,
                            label: "Gemini 2.5 Pro",
                            description: "gemini-hint",
                            model: gemini,
                        },
                    ],
                    {
                        title: "LLM Model Selection",
                        placeHolder: "Select which model to use",
                        ignoreFocusOut: true,
                    },
                );
            }),
        );

        it(
            "should prompt the user to select a new model ad hoc " +
                "when the active model is no longer supported",
            withSandbox(async (sandbox) => {
                // --- arrange ---
                const stubs = createTestStubs({
                    sandbox,
                    readFileOnFsResult: sandbox
                        .stub()
                        .resolves(JSON.stringify([openai])),
                    openAiModelsResult: Result.success(["openai:gpt-4o"]),
                    googleModelsResult: Result.success([
                        "google:models/gemini-2.5-pro",
                    ]),
                    getOnConfigResult: "google:models/gemini-2.5-pro",
                    showQuickPickResult: anyQuickPickResult,
                });

                // --- act ---
                await ModelManager.resolveActiveModel(
                    stubs.context,
                    VendorDescriptor.create(Vendors.all()),
                    stubs.providers,
                    "any-cmd",
                );

                // --- assert ---
                expect(stubs.showWarnMsg).toHaveBeenCalledOnceWith(
                    "LectorGPT: The active model is no longer supported. " +
                        "Please select a new model.",
                );

                expect(stubs.showQuickPick).toHaveBeenCalledOnceWith(
                    [
                        {
                            kind: vsc.QuickPickItemKind.Separator,
                            label: "OpenAI API",
                        },
                        {
                            kind: vsc.QuickPickItemKind.Default,
                            label: "GPT-4o",
                            description: "gpt-hint",
                            model: openai,
                        },
                    ],
                    {
                        title: "LLM Model Selection",
                        placeHolder: "Select which model to use",
                        ignoreFocusOut: true,
                    },
                );
            }),
        );

        it(
            "should prompt the user to select a new model ad hoc " +
                "when the active model is from a vendor " +
                "which is not part of the active vendor setup",
            withSandbox(async (sandbox) => {
                // --- arrange ---
                const stubs = createTestStubs({
                    sandbox,
                    readFileOnFsResult: sandbox
                        .stub()
                        .resolves(JSON.stringify([openai, gemini])),
                    openAiModelsResult: Result.success(["openai:gpt-4o"]),
                    googleModelsResult: Result.success([
                        "google:models/gemini-2.5-pro",
                    ]),
                    getOnConfigResult: "google:models/gemini-2.5-pro",
                    showQuickPickResult: anyQuickPickResult,
                });

                // --- act ---
                await ModelManager.resolveActiveModel(
                    stubs.context,
                    VendorDescriptor.create(["openai"]),
                    stubs.providers,
                    "any-cmd",
                );

                // --- assert ---
                expect(stubs.showWarnMsg).toHaveBeenCalledOnceWith(
                    'LectorGPT: The active model "Gemini 2.5 Pro" is from ' +
                        'vendor "Google API", which is not part of the ' +
                        "active vendor setup. Please select a new model or " +
                        "activate its vendor.",
                );

                expect(stubs.showQuickPick).toHaveBeenCalledOnceWith(
                    [
                        {
                            kind: vsc.QuickPickItemKind.Separator,
                            label: "OpenAI API",
                        },
                        {
                            kind: vsc.QuickPickItemKind.Default,
                            label: "GPT-4o",
                            description: "gpt-hint",
                            model: openai,
                        },
                        {
                            kind: vsc.QuickPickItemKind.Separator,
                            label: "Google API",
                        },
                        {
                            kind: vsc.QuickPickItemKind.Default,
                            label: "✓  Gemini 2.5 Pro",
                            description: "gemini-hint",
                            model: gemini,
                        },
                    ],
                    {
                        title: "LLM Model Selection",
                        placeHolder: "Select which model to use",
                        ignoreFocusOut: true,
                    },
                );
            }),
        );

        it(
            "should report an error and return undefined when the selection " +
                "process was canceled and no active model exists",
            withSandbox(async (sandbox) => {
                // --- arrange ---
                const stubs = createTestStubs({
                    sandbox,
                    readFileOnFsResult: sandbox
                        .stub()
                        .resolves(JSON.stringify([openai, gemini])),
                    openAiModelsResult: Result.success(["openai:gpt-4o"]),
                    googleModelsResult: Result.success([
                        "google:models/gemini-2.5-pro",
                    ]),
                    getOnConfigResult: "",
                    showQuickPickResult: anyQuickPickResult,
                });

                // --- act ---
                const result = await ModelManager.resolveActiveModel(
                    stubs.context,
                    VendorDescriptor.create(Vendors.all()),
                    stubs.providers,
                    "any-cmd",
                );

                // --- assert ---
                expect(result).toBeUndefined();
                expect(stubs.updateOnConfig).not.toHaveBeenCalled();
                expect(stubs.showInfoMsg).not.toHaveBeenCalled();
                expect(stubs.showErrorMsg).toHaveBeenCalledWith(
                    'LectorGPT: The command "any-cmd" requires a supported ' +
                        "model from the active vendor setup to proceed.",
                );
            }),
        );
    });
});
