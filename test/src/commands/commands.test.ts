// -----------------------------------------------------------------------------
// Author:  Samuel Lörtscher
// Date:    25 January 2026
// Project: LectorGPT: LaTeX text refinement powered by OpenAI and Google
// -----------------------------------------------------------------------------

//

// import all required third party modules
import * as vsc from "vscode";
import type { SinonSandbox } from "sinon";
import expect from "expect";

// import all required project modules
import { Vendor, Vendors } from "@lectorgpt/types";
import {
    ModelDescriptor,
    SourceDescriptor,
    VendorDescriptor,
} from "@lectorgpt/descriptors";
import { ProviderFactory } from "@lectorgpt/factories";
import { ModelProvider, OpenAIModelProvider } from "@lectorgpt/providers";
import {
    ModelManager,
    PromptManager,
    SecretManager,
    VendorManager,
} from "@lectorgpt/managers";
import { EditorService, InferenceService } from "@lectorgpt/services";
import { Commands } from "@lectorgpt/commands";
import { withSandbox, stub } from "@lectorgpt/testkit";

type StubsParams = {
    sandbox: SinonSandbox;
    activeTextEditor?: vsc.TextEditor | undefined;
    resolveActiveVendorsResult?: VendorDescriptor | undefined;
    resolveActiveApiKeysResult?: Map<Vendor, string> | undefined;
    createProviderMapResult?: Map<Vendor, ModelProvider> | undefined;
    resolveActiveModelResult?: ModelDescriptor | undefined;
    resolveActiveSourceResult?: SourceDescriptor | undefined;
    loadActiveSystemPromptResult?: string | undefined;
    refineTextResult?: string | undefined;
};

const createTestStubs = ({
    sandbox,
    activeTextEditor,
    resolveActiveVendorsResult,
    resolveActiveApiKeysResult,
    createProviderMapResult,
    resolveActiveModelResult,
    resolveActiveSourceResult,
    loadActiveSystemPromptResult,
    refineTextResult,
}: StubsParams) => {
    return {
        activeTextEditor: sandbox
            .stub(vsc.window, "activeTextEditor")
            .get(() => activeTextEditor),

        getCurrentSelection: sandbox
            .stub(EditorService, "getCurrentSelection")
            .resolves(stub<vsc.Selection>({})),

        selectActiveVendors: sandbox
            .stub(VendorManager, "selectActiveVendors")
            .resolves(VendorDescriptor.create(Vendors.all())),

        resolveActiveVendors: sandbox
            .stub(VendorManager, "resolveActiveVendors")
            .resolves(resolveActiveVendorsResult),

        registerNewApiKey: sandbox
            .stub(SecretManager, "registerNewApiKey")
            .resolves("any-secret"),

        unregisterApiKey: sandbox
            .stub(SecretManager, "unregisterApiKey")
            .resolves(undefined),

        resolveActiveApiKeys: sandbox
            .stub(SecretManager, "resolveActiveApiKeys")
            .resolves(resolveActiveApiKeysResult),
        createProviderMap: sandbox

            .stub(ProviderFactory, "createProviderMap")
            .resolves(createProviderMapResult),

        selectActiveModel: sandbox
            .stub(ModelManager, "selectActiveModel")
            .resolves(stub<ModelDescriptor>({})),

        resolveActiveModel: sandbox
            .stub(ModelManager, "resolveActiveModel")
            .resolves(resolveActiveModelResult),

        selectActiveSource: sandbox
            .stub(PromptManager, "selectActiveSource")
            .resolves(stub<SourceDescriptor>({})),

        resolveActiveSource: sandbox
            .stub(PromptManager, "resolveActiveSource")
            .resolves(resolveActiveSourceResult),

        loadActiveSystemPrompt: sandbox
            .stub(PromptManager, "loadActiveSystemPrompt")
            .resolves(loadActiveSystemPromptResult),

        refineText: sandbox
            .stub(InferenceService, "refineText")
            .resolves(refineTextResult),

        insertSuggestion: sandbox
            .stub(EditorService, "insertSuggestion")
            .resolves(undefined),
    };
};

describe("Commands", () => {
    const context = stub<vsc.ExtensionContext>({});
    const vendors = VendorDescriptor.create(Vendors.all());
    const apiKeys = new Map<Vendor, string>([["openai", "any-secret"]]);
    const providers = new Map<Vendor, OpenAIModelProvider>([
        ["openai", stub<OpenAIModelProvider>({})],
    ]);
    const model = stub<ModelDescriptor>({});
    const source = stub<SourceDescriptor>({});

    describe("selectActiveVendors", () => {
        it(
            "should execute flawlessly",
            withSandbox(async (sandbox) => {
                // --- arrange ---
                const stubs = createTestStubs({ sandbox });

                // --- act ---
                await Commands.selectActiveVendors({
                    title: "LectorGPT: Select Active Vendor Setup",
                    context: stub<vsc.ExtensionContext>({}),
                })();

                // --- assert ---
                expect(stubs.selectActiveVendors).toHaveBeenCalledOnce();
            }),
        );
    });

    //

    //

    describe("registerNewApiKey", () => {
        it(
            "should execute flawlessly",
            withSandbox(async (sandbox) => {
                // --- arrange ---
                const stubs = createTestStubs({
                    sandbox,
                    resolveActiveVendorsResult: vendors,
                });

                // --- act ---
                await Commands.registerNewApiKey({
                    title: "LectorGPT: Register New API Key",
                    context,
                })();

                // --- assert ---
                expect(stubs.resolveActiveVendors).toHaveBeenCalledOnceWith(
                    "LectorGPT: Register New API Key",
                );

                expect(stubs.registerNewApiKey).toHaveBeenCalledOnceWith(
                    context,
                    vendors,
                );
            }),
        );
    });

    //

    //

    describe("unregisterApiKey", () => {
        it(
            "should execute flawlessly",
            withSandbox(async (sandbox) => {
                // --- arrange ---
                const stubs = createTestStubs({ sandbox });

                // --- act ---
                await Commands.unregisterApiKey({
                    title: "LectorGPT: Unregister API Key",
                    context,
                })();

                // --- assert ---
                expect(stubs.unregisterApiKey).toHaveBeenCalledOnceWith(
                    context,
                );
            }),
        );
    });

    //

    //

    describe("selectActiveModel", () => {
        it(
            "should execute flawlessly",
            withSandbox(async (sandbox) => {
                // --- arrange ---
                const stubs = createTestStubs({
                    sandbox,
                    resolveActiveVendorsResult: vendors,
                    resolveActiveApiKeysResult: apiKeys,
                    createProviderMapResult: providers,
                });

                // --- act ---
                await Commands.selectActiveModel({
                    title: "LectorGPT: Select Active Model",
                    context,
                })();

                // --- assert ---
                expect(stubs.resolveActiveVendors).toHaveBeenCalledOnceWith(
                    "LectorGPT: Select Active Model",
                );

                expect(stubs.resolveActiveApiKeys).toHaveBeenCalledOnceWith(
                    context,
                    vendors,
                    "LectorGPT: Select Active Model",
                );

                expect(stubs.createProviderMap).toHaveBeenCalledOnceWith(
                    vendors,
                    apiKeys,
                );

                expect(stubs.selectActiveModel).toHaveBeenCalledOnceWith(
                    context,
                    vendors,
                    providers.values(),
                );
            }),
        );
    });

    //

    //

    describe("selectActiveSystemPromptSource", () => {
        it(
            "should execute flawlessly",
            withSandbox(async (sandbox) => {
                // --- arrange ---
                const stubs = createTestStubs({ sandbox });

                // --- act ---
                await Commands.selectActiveSystemPromptSource({
                    title: "LectorGPT: Select Active System Prompt Source",
                    context: stub<vsc.ExtensionContext>({}),
                })();

                // --- assert ---
                expect(stubs.selectActiveSource).toHaveBeenCalledOnce();
            }),
        );
    });

    //

    //

    describe("refineActiveSelection", () => {
        it(
            "should execute flawlessly",
            withSandbox(async (sandbox) => {
                // --- arrange ---
                const textEditor = stub<vsc.TextEditor>({
                    document: stub<vsc.TextDocument>({
                        getText: sandbox.stub().returns("any-text"),
                    }),
                });

                const stubs = createTestStubs({
                    sandbox,
                    activeTextEditor: textEditor,
                    resolveActiveVendorsResult: vendors,
                    resolveActiveApiKeysResult: apiKeys,
                    createProviderMapResult: providers,
                    resolveActiveModelResult: model,
                    resolveActiveSourceResult: source,
                    loadActiveSystemPromptResult: "any-system-prompt",
                    refineTextResult: "any-suggestion",
                });

                // --- act ---
                await Commands.refineActiveSelection({
                    title: "LectorGPT: Refine Active Selection",
                    context,
                })();

                // --- assert ---
                expect(stubs.getCurrentSelection).toHaveBeenCalledOnce();
                expect(stubs.resolveActiveVendors).toHaveBeenCalledOnceWith(
                    "LectorGPT: Refine Active Selection",
                );

                expect(stubs.resolveActiveApiKeys).toHaveBeenCalledOnceWith(
                    context,
                    vendors,
                    "LectorGPT: Refine Active Selection",
                );

                expect(stubs.createProviderMap).toHaveBeenCalledOnceWith(
                    vendors,
                    apiKeys,
                );

                expect(stubs.resolveActiveModel).toHaveBeenCalledOnceWith(
                    context,
                    vendors,
                    providers.values(),
                    "LectorGPT: Refine Active Selection",
                );

                expect(stubs.resolveActiveSource).toHaveBeenCalledOnce();
                expect(stubs.loadActiveSystemPrompt).toHaveBeenCalledOnceWith(
                    context,
                    source,
                );

                expect(stubs.refineText).toHaveBeenCalledOnceWith({
                    provider: providers.get("openai")!,
                    model,
                    systemPrompt: "any-system-prompt",
                    userPrompt: "any-text",
                });

                expect(stubs.insertSuggestion).toHaveBeenCalledOnceWith(
                    textEditor,
                    "any-suggestion",
                    model,
                );
            }),
        );

        it(
            "should never execute when there is no active text editor",
            withSandbox(async (sandbox) => {
                // --- arrange ---
                const stubs = createTestStubs({
                    sandbox,
                    activeTextEditor: undefined,
                    resolveActiveVendorsResult: vendors,
                    resolveActiveApiKeysResult: apiKeys,
                    createProviderMapResult: providers,
                    resolveActiveModelResult: model,
                    resolveActiveSourceResult: source,
                    loadActiveSystemPromptResult: "any-system-prompt",
                    refineTextResult: "any-suggestion",
                });

                // --- act ---
                await Commands.refineActiveSelection({
                    title: "LectorGPT: Refine Active Selection",
                    context,
                })();

                // --- assert ---
                expect(stubs.getCurrentSelection).not.toHaveBeenCalled();
                expect(stubs.resolveActiveVendors).not.toHaveBeenCalled();
                expect(stubs.resolveActiveApiKeys).not.toHaveBeenCalled();
                expect(stubs.createProviderMap).not.toHaveBeenCalled();
                expect(stubs.resolveActiveModel).not.toHaveBeenCalled();
                expect(stubs.resolveActiveSource).not.toHaveBeenCalled();
                expect(stubs.loadActiveSystemPrompt).not.toHaveBeenCalled();
                expect(stubs.refineText).not.toHaveBeenCalled();
                expect(stubs.insertSuggestion).not.toHaveBeenCalled();
            }),
        );
    });
});
