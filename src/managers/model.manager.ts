// -----------------------------------------------------------------------------
// Author:  Samuel Lörtscher
// Date:    25 January 2026
// Project: LectorGPT: LaTeX text refinement powered by OpenAI and Google
// -----------------------------------------------------------------------------

//

// import all required third party modules
import * as vsc from "vscode";

// import all required project modules
import { CONFIG } from "@lectorgpt/constants";
import { Result, Vendor } from "@lectorgpt/types";
import {
    VendorDescriptor,
    ModelDescriptor,
    ModelDescriptorCatalog,
} from "@lectorgpt/descriptors";
import { ModelProvider } from "@lectorgpt/providers";
import { Guards, Ux } from "@lectorgpt/utils";

//

// -----------------------------------------------------------------------------
// Module Scoped (Private) Types & Functions
// -----------------------------------------------------------------------------

//

/**
 * Loads the curated model catalog from the extension's assets. The catalog is
 * expected to be a JSON file containing an array of {@link ModelDescriptor}
 * objects. The function reads the file, parses the JSON, and converts it into
 * a map for quick lookup.
 *
 * @param context - The extension context used to access the extension's assets.
 *
 * @returns A promise that resolves to a map of model descriptors keyed by
 * "vendor:id" or undefined if loading fails.
 *
 * @author Samuel Lörtscher
 */
const loadCuratedModelCatalog = async (
    context: vsc.ExtensionContext,
): Promise<Map<string, ModelDescriptor> | undefined> => {
    // construct an URI to the model descriptor catalog asset
    const uri = vsc.Uri.joinPath(
        context.extensionUri,
        "assets",
        "models",
        "curated.json",
    );

    try {
        // read the file contents and parse it as JSON
        // to build the array of model descriptors
        const data = await vsc.workspace.fs.readFile(uri);
        const json = JSON.parse(
            Buffer.from(data).toString("utf8"),
        ) as ModelDescriptor[];

        // convert the array of model descriptors into a map for quick lookup
        return new Map(
            json.map((model) => [`${model.vendor}:${model.id}`, model]),
        );
    } catch (exp: unknown) {
        // any unexpected error must obviously be reported
        vsc.window.showErrorMessage(
            Ux.withContext(
                "Failed to load the curated model catalog. " +
                    "Please reinstall the extension or contact support.",
                exp,
            ),
        );

        return undefined;
    }
};

//

//

/**
 * Resolves the supported models by querying all available model providers and
 * cross-referencing the results with the curated model catalog. This function
 * ensures that only models that are both supported by the given providers and
 * included in the given curated model catalog are returned.
 *
 * @param providers - The list of model providers to query for supported models.
 * @param catalog - The curated model catalog to cross-reference against.
 *
 * @returns A promise that resolves to an array of supported model descriptors
 * or `undefined` if no supported models are available.
 *
 * @author Samuel Lörtscher
 */
const resolveSupportedModels = async (
    providers: ModelProvider[],
    catalog: ModelDescriptorCatalog,
): Promise<ModelDescriptor[] | undefined> => {
    // query all providers for their supported models in parallel
    const results = await Promise.all(
        providers.map(async (provider) => provider.listModels()),
    );

    // check if any of the providers reported an error during listing their
    // supported models. If so, report those errors and abort the operation as
    // it cannot be guaranteed that the returned models are actually supported
    const failedResults = results.filter(Result.isFailure);
    if (failedResults.length > 0) {
        for (const error of failedResults) {
            vsc.window.showErrorMessage(
                `LectorGPT: ${Ux.withContext(error.context, error.error)}`,
            );
        }

        return undefined;
    }

    // cross-reference the supported models from the given providers with the
    // given curated model catalog to ensure that only supported and curated
    // models are returned. This guarantees that the available models for
    // prompting the user are both compatible with the providers as well as
    // curated for quality and reliability
    const supportedModels = results
        .filter(Result.isSuccess)
        .flatMap((result) => result.value)
        .map((model) => catalog.get(model))
        .filter(Guards.isDefined);

    // if no supported models are found after cross-referencing, the user is
    // informed about the situation and the operation is aborted as it cannot
    // be proceeded without any supported model
    if (supportedModels.length === 0) {
        vsc.window.showErrorMessage(
            "LectorGPT: No supported models are available. " +
                "Please check your configuration or contact support.",
        );

        return undefined;
    }

    // at this point, it is guaranteed that there is at least one supported
    // model that is also part of the given curated model catalog, so we can
    // safely return the list of supported models to the caller for further
    // processing and user prompting
    return supportedModels;
};

//

//

/**
 * Returns the currently active model based on the active model-id stored in the
 * workspace settings. The function validates that the active model is still
 * part of the given curated model catalog and the active vendor setup. If any
 * of these validations fail, the user is informed and `undefined` is returned
 * to indicate that there is no valid active model currently configured.
 *
 * @param vendors - The active vendor setup to validate against.
 * @param catalog - The curated model catalog to validate against.
 * @param intent - The intent of the operation, either "selection" or
 *                 "resolution".
 *
 * @returns A promise that resolves to the active model or `undefined` if no
 * valid active model is configured.
 *
 * @author Samuel Lörtscher
 */
const getActiveModel = async (
    vendors: VendorDescriptor,
    catalog: ModelDescriptorCatalog,
    intent: "selection" | "resolution",
): Promise<ModelDescriptor | undefined> => {
    // first, resolve the active model-id from the workspace settings. This is
    // the source of truth for the currently active model and is used to ensure
    // consistency across all operations that require the active model. The
    // active model-id is expected to be in the format "vendor:id" to allow for
    // quick lookup in the curated model catalog
    const activeModelId = vsc.workspace
        .getConfiguration(CONFIG.ROOT)
        .get<string>(CONFIG.MODEL);

    // validate that the active model is still part of the curated model catalog
    // (this is only relevant for resolution, since during selection the user is
    // explicitly prompted to select a new model, so it does not matter whether
    // the previously active model is still valid or not)
    if (activeModelId && intent === "resolution") {
        if (!catalog.has(activeModelId)) {
            vsc.window.showWarningMessage(
                "LectorGPT: The active model is no longer supported. " +
                    "Please select a new model.",
            );

            return undefined;
        }
    }

    // if the active model is still part of the curated model catalog, we can
    // safely retrieve its full descriptor for further validation and potential
    // user prompting.
    const activeModel = Guards.isNonEmpty(activeModelId)
        ? catalog.get(activeModelId)
        : undefined;

    // validate that the active model is still part of the active vendor setup
    // (this is only relevant for resolution, since during selection the user is
    // explicitly prompted to select a new model, so it does not matter whether
    // the previously active model is still valid or not)
    if (activeModel && intent === "resolution") {
        if (!vendors.setup.includes(activeModel.vendor)) {
            vsc.window.showWarningMessage(
                `LectorGPT: The active model "${activeModel.name}" ` +
                    `is from vendor "${Vendor.label(activeModel.vendor)}", ` +
                    `which is not part of the active vendor setup. ` +
                    `Please select a new model or adjust the vendor setup.`,
            );

            return undefined;
        }
    }

    // at this point, it is guaranteed that the active model
    // is part of the curated model catalog as well as the
    // active vendor setup
    return activeModel;
};

//

// -----------------------------------------------------------------------------
// Exported Public Interface
// -----------------------------------------------------------------------------

//

/**
 * The ModelDescriptorQuickPickItem is a specialized {@link vsc.QuickPickItem}
 * that includes a `model` property containing the {@link ModelDescriptor}
 * associated with the quick pick item.
 *
 * @author Samuel Lörtscher
 */
export type ModelDescriptorQuickPickItem = vsc.QuickPickItem & {
    model: ModelDescriptor;
};

//

//

/**
 * The ModelManager is responsible for managing the model selection and
 * resolution logic, including prompting the user to select an active model,
 * resolving the active model based on the caller's intent, and ensuring that
 * the active model is valid and compatible with the active vendor setup and
 * the curated model catalog.
 *
 * @author Samuel Lörtscher
 */
export const ModelManager = {
    /**
     * Selects a new active model by prompting the user with a quick pick of all
     * supported models. The selected model is then persisted in the workspace
     * settings as the new active model.
     *
     * @param context - The extension context used to access the extension's
     *                  assets.
     *
     * @param vendors - The active vendor setup to filter the supported models.
     * @param providers - A list of model providers to query for supported
     *                    models.
     *
     * @returns A promise that resolves to the selected active model or
     * `undefined` when the operation was canceled.
     *
     * @author Samuel Lörtscher
     */
    selectActiveModel: async (
        context: vsc.ExtensionContext,
        vendors: VendorDescriptor,
        providers: ModelProvider[],
    ): Promise<ModelDescriptor | undefined> => {
        // resolve the curated model catalog and abort if it fails
        // to do so, as it is essential for the model selection process
        const catalog = await loadCuratedModelCatalog(context);
        if (!catalog) {
            return undefined;
        }

        // resolve the supported models by cross-referencing the models
        // supported by the providers with the curated model catalog to ensure
        // that only valid and compatible models are presented to the user
        const supportedModels = await resolveSupportedModels(
            providers,
            catalog,
        );

        // if no supported models are available, the operation is aborted
        // as it cannot be proceeded without any model to select from
        if (!supportedModels) {
            return undefined;
        }

        // resolve the currently active model to properly annotate the quick
        // pick items and provide context to the user during selection. This
        // also ensures that the user is aware of the currently active model
        // and can make an informed decision when selecting a new model
        const activeModel = await getActiveModel(vendors, catalog, "selection");

        // group the supported models by their vendor to structure the quick
        // pick items in a way that is easy to navigate for the user, especially
        // when there are many supported models from different vendors. This
        // also allows for better visual organization and separation of models
        // from different vendors in the quick pick interface
        const modelsByVendor = Map.groupBy(
            supportedModels,
            (model) => model.vendor,
        );

        // prompt the user to select a new active model from the list of
        // supported models. The currently active model is annotated with an
        // active mark to visually distinguish it from the other options
        const selectedItem =
            await vsc.window.showQuickPick<ModelDescriptorQuickPickItem>(
                [...modelsByVendor.keys()].flatMap((vendor) => [
                    {
                        label: Vendor.label(vendor),
                        kind: vsc.QuickPickItemKind.Separator,
                        model: undefined!,
                    },
                    ...modelsByVendor
                        .get(vendor)!
                        .sort((a, b) => a.order - b.order)
                        .map((model) => ({
                            kind: vsc.QuickPickItemKind.Default,
                            label: Ux.withActiveMark(
                                ModelDescriptor.label(model),
                                ModelDescriptor.equal(model, activeModel),
                            ),
                            description: model.hint,
                            model,
                        })),
                ]),
                {
                    title: "LLM Model Selection",
                    placeHolder: "Select which model to use",
                    ignoreFocusOut: true,
                },
            );

        // if the user selected a new model,
        // extract it from the selected quick pick item.
        const newModel =
            selectedItem?.kind === vsc.QuickPickItemKind.Default
                ? selectedItem?.model
                : undefined;

        // if the user selected a new model that is different from the currently
        // active one, persist the new model in the workspace settings and show
        // a confirmation message to the user. If the user selected the
        // currently active model or canceled the operation, no changes are made
        // and no message is shown
        if (newModel && !ModelDescriptor.equal(newModel, activeModel)) {
            // persist the selected model in the workspace settings
            await vsc.workspace
                .getConfiguration(CONFIG.ROOT)
                .update(
                    CONFIG.MODEL,
                    `${newModel.vendor}:${newModel.id}`,
                    vsc.ConfigurationTarget.Workspace,
                );

            vsc.window.showInformationMessage(
                `LectorGPT: Successfully selected model "${newModel.name}".`,
            );
        }

        // finally, return the selected model to the caller
        // (undefined when the user canceled the operation)
        return newModel;
    },

    /**
     * Resolves the active model for the given command. If the active model is
     * not configured, invalid, or incompatible with the active vendor setup,
     * the user is prompted to select a new active model ad hoc. If the user
     * cancels the operation, undefined is returned.
     *
     * @param context - The extension context used to access the extension's
     *                  assets.
     *
     * @param vendors - The active vendor setup.
     * @param providers - The available model providers.
     * @param cmd - The command that requires the active model.
     *
     * @returns A promise that resolves to the active model or `undefined` when
     * no model was configured and the selection was canceled by the user.
     *
     * @author Samuel Lörtscher
     */
    resolveActiveModel: async (
        context: vsc.ExtensionContext,
        vendors: VendorDescriptor,
        providers: ModelProvider[],
        cmd: string,
    ): Promise<ModelDescriptor | undefined> => {
        // resolve the curated model catalog and abort if it fails
        // to do so, as it is essential for the model selection process
        const catalog = await loadCuratedModelCatalog(context);
        if (!catalog) {
            return undefined;
        }

        // resolve the currently active model to determine whether it is valid
        // and compatible with the active vendor setup and the curated model
        // catalog
        const activeModel = await getActiveModel(
            vendors,
            catalog,
            "resolution",
        );

        // if there is an active model and it is valid, it can be returned
        // immediately without any user interaction, which allows for a seamless
        // experience when the user has already set up his preferred model
        // configuration
        if (activeModel) {
            return activeModel;
        }

        // when there is no valid active model configured, the user must be
        // prompted to select a new active model ad hoc to proceed with the
        // command execution
        const newModel = await ModelManager.selectActiveModel(
            context,
            vendors,
            providers,
        );

        // if the user did not select a new model, the operation is aborted as
        // it cannot be proceeded without an active model. The user is informed
        // about the situation
        if (!newModel) {
            vsc.window.showErrorMessage(
                `LectorGPT: The command "${cmd}" requires a supported model ` +
                    "from the active vendor setup to proceed.",
            );
        }

        // finally return the resolved model
        // (undefined when the user canceled the operation)
        return newModel;
    },
} as const;
