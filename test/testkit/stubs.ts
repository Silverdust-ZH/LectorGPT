// -----------------------------------------------------------------------------
// Author:  Samuel Lörtscher
// Date:    25 January 2026
// Project: LectorGPT: LaTeX text refinement powered by OpenAI and Google
// -----------------------------------------------------------------------------

//

// import all required third party modules
import * as vsc from "vscode";

// import all required project modules
import { ModelProvider } from "@lectorgpt/providers";
import { Result } from "@lectorgpt/types/result.type";

//

// -----------------------------------------------------------------------------
// Exported Public Interface
// -----------------------------------------------------------------------------

//

/**
 * Creates a stub of the given object.
 *
 * @param obj - The object to stub.
 * @returns The stubbed object.
 *
 * @author Samuel Lörtscher
 */
export const stub = <T>(obj: Partial<T>) => obj as unknown as T;

/**
 * A collection of factory functions for creating Sinon stubs for various VS
 * Code APIs and other common functionalities used in the LectorGPT extension.
 * Each factory function takes a Sinon sandbox as an argument and returns an
 * object containing the relevant stubs for that API or functionality. This
 * allows for easy setup and teardown of stubs within tests, ensuring that all
 * stubs are properly restored after each test case.
 *
 * @author Samuel Lörtscher
 */
export const Stubs = {
    /**
     * Creates stubs for the VS Code message API (information, warning, and
     * error messages) that resolve to undefined when called.
     *
     * @param sandbox - The Sinon sandbox to use for creating the stubs.
     * @returns An object containing the stubs for the VS Code message APIs.
     *
     * @author Samuel Lörtscher
     */
    msgs: (sandbox: sinon.SinonSandbox) => {
        return {
            showInfoMsg: sandbox
                .stub(vsc.window, "showInformationMessage")
                .resolves(undefined),

            showWarnMsg: sandbox
                .stub(vsc.window, "showWarningMessage")
                .resolves(undefined),

            showErrorMsg: sandbox
                .stub(vsc.window, "showErrorMessage")
                .resolves(undefined),
        };
    },

    //

    //

    /**
     * Creates a stub for the VS Code input box API that resolves to a specified
     * result when called.
     *
     * @param sandbox - The Sinon sandbox to use for creating the stub.
     * @param result - The result to resolve when the input box is shown.
     * @returns An object containing the stub for the VS Code input box API.
     *
     * @author Samuel Lörtscher
     */
    inputBox: (sandbox: sinon.SinonSandbox, result: string | undefined) => {
        return {
            showInputBox: sandbox
                .stub(vsc.window, "showInputBox")
                .resolves(result),
        };
    },

    //

    //

    /**
     * Creates a stub for the VS Code quick pick API that resolves to a
     * specified result when called.
     *
     * @param sandbox - The Sinon sandbox to use for creating the stub.
     * @param result - The result to resolve when the quick pick is shown.
     * @returns An object containing the stub for the VS Code quick pick API.
     *
     * @author Samuel Lörtscher
     */
    quickPick: <T>(
        sandbox: sinon.SinonSandbox,
        result: (vsc.QuickPickItem & T) | undefined,
    ) => {
        return {
            showQuickPick: sandbox
                .stub(vsc.window, "showQuickPick")
                .resolves(result),
        };
    },

    //

    //

    /**
     * Creates a stub for the VS Code status bar item API.
     *
     * @param sandbox - The Sinon sandbox to use for creating the stub.
     * @returns An object containing the stubs for the VS Code status bar item
     * API.
     *
     * @author Samuel Lörtscher
     */
    statusBarItem: (sandbox: sinon.SinonSandbox) => {
        // create stubs for the status bar item methods
        const showOnStatusBarItem = sandbox.stub();
        const disposeOnStatusBarItem = sandbox.stub();
        const statusBarItem = stub<vsc.StatusBarItem>({
            text: "",
            tooltip: "",
            show: showOnStatusBarItem,
            dispose: disposeOnStatusBarItem,
        });

        return {
            createStatusBarItem: sandbox
                .stub(vsc.window, "createStatusBarItem")
                .returns(statusBarItem),
            statusBarItem: statusBarItem,
            showOnStatusBarItem,
            disposeOnStatusBarItem,
        };
    },

    //

    //

    /**
     * Creates a stub for the VS Code configuration API that returns a specified
     * result when the `get` method is called and resolves to undefined when the
     * `update` method is called.
     *
     * @param sandbox - The Sinon sandbox to use for creating the stub.
     * @param result - The result to return when the `get` method is called.
     * @returns An object containing the stubs for the VS Code configuration
     * API.
     *
     * @author Samuel Lörtscher
     */
    config: <T>(sandbox: sinon.SinonSandbox, result: T | undefined) => {
        // create stubs for the configuration methods
        const updateOnConfig = sandbox.stub().resolves(undefined);
        const getOnConfig = sandbox.stub().returns(result);

        return {
            getConfig: sandbox.stub(vsc.workspace, "getConfiguration").returns(
                stub<vsc.WorkspaceConfiguration>({
                    update: updateOnConfig,
                    get: getOnConfig,
                }),
            ),
            updateOnConfig,
            getOnConfig,
        };
    },

    //

    //

    /**
     * Creates a stub for the VS Code extension context API that returns a
     * specified result when the secret storage methods are called.
     *
     * @param sandbox - The Sinon sandbox to use for creating the stub.
     * @param getOnSecretResult - The result to return when the secret storage
     * `get` method is called.
     * @returns An object containing the stubs for the VS Code extension context
     * API.
     *
     * @author Samuel Lörtscher
     */
    context: (
        sandbox: sinon.SinonSandbox,
        getOnSecretResult?: string | undefined,
    ) => {
        // create stubs for the secret storage methods
        const getOnSecret = sandbox.stub().resolves(getOnSecretResult);
        const storeOnSecret = sandbox.stub().resolves(undefined);
        const deleteOnSecret = sandbox.stub().resolves(undefined);

        return {
            context: stub<vsc.ExtensionContext>({
                extensionUri: vsc.Uri.file("/lectorgpt"),
                secrets: stub<vsc.SecretStorage>({
                    store: storeOnSecret,
                    get: getOnSecret,
                    delete: deleteOnSecret,
                }),
            }),
            storeOnSecret,
            getOnSecret,
            deleteOnSecret,
        };
    },

    //

    //

    /**
     * Creates a stub for the VS Code workspace folder API that returns a
     * specified result when called.
     *
     * @param sandbox - The Sinon sandbox to use for creating the stub.
     * @param result - The result to return when the workspace folder is
     * requested.
     * @returns An object containing the stub for the VS Code workspace folder
     * API.
     *
     * @author Samuel Lörtscher
     */
    workspaceFolder: (
        sandbox: sinon.SinonSandbox,
        result: string | undefined,
    ) => {
        return {
            getWorkspaceFolder: sandbox
                .stub(vsc.workspace, "getWorkspaceFolder")
                .returns(
                    result !== undefined
                        ? stub<vsc.WorkspaceFolder>({
                              uri: vsc.Uri.file(result),
                          })
                        : undefined,
                ),
        };
    },

    //

    //

    /**
     * Creates a stub for the VS Code workspace file API that returns a
     * specified result when the `findFiles` method is called and uses a
     * provided stub for the `readFile` method of the file system.
     *
     * @param sandbox - The Sinon sandbox to use for creating the stubs.
     * @param findFilesResult - The result to return when the `findFiles`
     * method is called.
     * @param readFileOnFs - The stub to use for the `readFile` method of the
     * file system.
     * @returns An object containing the stubs for the VS Code workspace file
     * API.
     *
     * @author Samuel Lörtscher
     */
    files: (
        sandbox: sinon.SinonSandbox,
        findFilesResult: string[] | undefined,
        readFileOnFs: sinon.SinonStub,
    ) => {
        return {
            findFiles: sandbox
                .stub(vsc.workspace, "findFiles")
                .resolves(
                    findFilesResult?.map((path) =>
                        stub<vsc.Uri>({ fsPath: path }),
                    ),
                ),
            fs: sandbox.stub(vsc.workspace, "fs").get(() =>
                stub<vsc.FileSystem>({
                    readFile: readFileOnFs,
                }),
            ),
            readFileOnFs,
        };
    },

    //

    //

    /**
     * Creates a stub for the VS Code text editor API that returns a specified
     * result when the `getText` method of the document is called and a
     * specified result when the `edit` method of the editor is called. It also
     * stubs the active text editor and its selection.
     *
     * @param sandbox - The Sinon sandbox to use for creating the stubs.
     * @param getTextOnDocumentResult - The result to return when the `getText`
     * method of the document is called.
     * @param editOnEditorResult - The result to return when the `edit` method
     * of the editor is called.
     * @returns An object containing the stubs for the VS Code text editor API.
     *
     * @author Samuel Lörtscher
     */
    textEditor: (
        sandbox: sinon.SinonSandbox,
        getTextOnDocumentResult?: string | undefined,
        editOnEditorResult?: boolean | undefined,
    ) => {
        // create a stub for the selection of the active text editor
        const selection = stub<vsc.Selection>({
            start: stub<vsc.Position>({ character: 7 }),
            end: stub<vsc.Position>({ character: 42 }),
        });

        // create stubs for the document and editor methods
        const insertOnEditorEdit = sandbox.stub();
        const getTextOnDocument = sandbox
            .stub()
            .returns(getTextOnDocumentResult);

        return {
            textEditor: sandbox.stub(vsc.window, "activeTextEditor").get(() =>
                stub<vsc.TextEditor>({
                    document: stub<vsc.TextDocument>({
                        getText: getTextOnDocument,
                    }),
                    selection,
                    edit: sandbox.stub().callsFake(async (callback) => {
                        callback(
                            stub<vsc.TextEditorEdit>({
                                insert: insertOnEditorEdit,
                            }),
                        );

                        return editOnEditorResult;
                    }),
                }),
            ),
            selection,
            getTextOnDocument,
            insertOnEditorEdit,
        };
    },

    //

    //

    /**
     * Creates a stub for the VS Code `withProgress` API that allows setting a
     * listener for the cancellation token's `onCancellationRequested` event.
     *
     * @param sandbox - The Sinon sandbox to use for creating the stub.
     * @param setListener - A function that takes a callback and sets it as a
     * listener for the cancellation token's `onCancellationRequested` event.
     * @returns An object containing the stub for the VS Code `withProgress`
     * API.
     *
     * @author Samuel Lörtscher
     */
    withProgress: (
        sandbox: sinon.SinonSandbox,
        setListener: (fn: () => void) => void,
    ) => {
        return {
            withProgress: sandbox
                .stub(vsc.window, "withProgress")
                .callsFake(async (_: vsc.ProgressOptions, fn) => {
                    return await fn(
                        stub<vsc.Progress<{}>>({}),
                        stub<vsc.CancellationToken>({
                            onCancellationRequested: stub<vsc.Event<void>>(
                                (cb: () => void) => setListener(cb),
                            ),
                        }),
                    );
                }),
        };
    },

    //

    //

    /**
     * Creates a stub for the global `AbortController` API that allows for
     * testing of cancellation behavior in the LectorGPT extension without
     * relying on the actual implementation of the `AbortController`.
     *
     * @param sandbox - The Sinon sandbox to use for creating the stub.
     * @returns An object containing the stubs for the `AbortController` API.
     *
     * @author Samuel Lörtscher
     */
    abortController: (sandbox: sinon.SinonSandbox) => {
        // create stubs for the AbortController methods and properties.
        const abortOnAbortController = sandbox.stub();
        const signalOnAbortController = stub<AbortSignal>({
            aborted: false,
        });

        // stub the global AbortController to return an object with the abort
        // method and the signal property when instantiated.
        sandbox.stub(globalThis, "AbortController").returns(
            stub<AbortController>({
                abort: abortOnAbortController,
                signal: signalOnAbortController,
            }),
        );

        return {
            abortOnAbortController,
            signalOnAbortController,
        };
    },

    /**
     * Creates stubs for the model providers used in the LectorGPT extension,
     * allowing for testing of interactions with these providers without making
     * actual API calls.
     *
     * @param listModelsOnOpenAIProviderResult - The result to return when the
     * `listModels` method of the OpenAI provider is called.
     * @param listModelsOnGoogleProviderResult - The result to return when the
     * `listModels` method of the Google provider is called.
     * @param refineTextOnModelProviderResult - The result to return when the
     * `refineText` method of either provider is called.
     * @returns An object containing the stubs for the model providers.
     *
     * @author Samuel Lörtscher
     */
    modelProviders: (
        sandbox: sinon.SinonSandbox,
        listModelsOnOpenAIProviderResult: Result<string[]>,
        listModelsOnGoogleProviderResult: Result<string[]>,
        refineTextOnModelProviderResult: Result<string>,
    ) => {
        // create stubs for the model provider methods
        const listModelsOnOpenAIProvider = sandbox
            .stub()
            .resolves(listModelsOnOpenAIProviderResult);

        const listModelsOnGoogleProvider = sandbox
            .stub()
            .resolves(listModelsOnGoogleProviderResult);

        const refineTextOnModelProvider = sandbox
            .stub()
            .resolves(refineTextOnModelProviderResult);

        return {
            providers: [
                stub<ModelProvider>({
                    listModels: listModelsOnOpenAIProvider,
                    refineText: refineTextOnModelProvider,
                }),

                stub<ModelProvider>({
                    listModels: listModelsOnGoogleProvider,
                    refineText: refineTextOnModelProvider,
                }),
            ],

            listModelsOnOpenAIProvider,
            listModelsOnGoogleProvider,
            refineTextOnModelProvider,
        };
    },
} as const;
