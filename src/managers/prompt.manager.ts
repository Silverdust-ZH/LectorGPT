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
import { SourceDescriptor } from "@lectorgpt/descriptors";
import { Guards, Ux } from "@lectorgpt/utils";

//

// -----------------------------------------------------------------------------
// Module Scoped (Private) Types & Functions
// -----------------------------------------------------------------------------

//

/**
 * Returns a list of all supported sources that can be activated by the user.
 * This is currently resolved by searching for all `*.prompt.md` files within
 * the current workspace, but can be easily extended in the future to support
 * additional sources if needed.
 *
 * @returns A promise that resolves to an array of supported sources.
 *
 * @author Samuel Lörtscher
 */
const resolveSupportedSources = async (): Promise<SourceDescriptor[]> => {
    // search for all `*.prompt.md` files within the current workspace, while
    // excluding the `node_modules` folder to avoid unnecessary clutter and
    // potential performance issues. Each found file is then transformed into a
    // corresponding source descriptor that can be selected by the user as the
    // active source
    const files =
        (await vsc.workspace.findFiles(
            "**/*.prompt.md",
            "**/node_modules/**",
        )) ?? [];

    // In addition to the found files, the default asset source is also included
    // as a supported source, ensuring that there is always at least one source
    // available for selection
    return [
        SourceDescriptor.asset(),
        ...files.map((file) =>
            SourceDescriptor.file(vsc.workspace.asRelativePath(file)),
        ),
    ];
};

//

//

/**
 * Returns the active  source from the workspace settings. If no active source
 * is configured, the default asset source is returned as a fallback to ensure
 * that there is always an active source available.
 *
 * @returns A promise that resolves to the active source.
 *
 * @author Samuel Lörtscher
 */
const getActiveSource = async (): Promise<SourceDescriptor> => {
    // read the active source from the workspace settings
    const customSource = vsc.workspace
        .getConfiguration(CONFIG.ROOT)
        .get<string>(CONFIG.CUSTOM_SYSTEM_PROMPT_SOURCE);

    // if a custom source is configured, return a corresponding file source
    // descriptor. Otherwise, return the default asset source descriptor as a
    // fallback to ensure that there is always an active source available
    return Guards.isNonEmpty(customSource)
        ? SourceDescriptor.file(customSource)
        : SourceDescriptor.asset();
};

//

// -----------------------------------------------------------------------------
// Exported Public Interface
// -----------------------------------------------------------------------------

//

/**
 * The SourceDescriptorQuickPickItem is a specialized {@link vsc.QuickPickItem}
 * that includes a `source` property containing the {@link SourceDescriptor}
 * associated with the quick pick item.
 *
 * @author Samuel Lörtscher
 */
export type SourceDescriptorQuickPickItem = vsc.QuickPickItem & {
    source: SourceDescriptor;
};

//

//

/**
 * The PromptManager is responsible for managing the system prompt sources,
 * including resolving the active source, prompting the user to select a
 * source, persisting the selected source, and loading the system prompt
 * based on the active source.
 *
 * @author Samuel Lörtscher
 */
export const PromptManager = {
    /**
     * Selects the active source by prompting the user with a quick pick of all
     * supported sources. The selected source is then persisted in the workspace
     * settings and returned to the caller.
     *
     * @returns A promise that resolves to the selected source or `undefined`
     * when the operation was canceled.
     *
     * @author Samuel Lörtscher
     */
    selectActiveSource: async (): Promise<SourceDescriptor | undefined> => {
        // resolve the supported and active sources to determine which
        // sources can be selected by the user and which one is currently
        // active to properly annotate the quick pick items
        const supportedSources = await resolveSupportedSources();
        const activeSource = await getActiveSource();

        // prompt the user to select a new active source from the list of
        // supported sources. The currently active source is annotated with an
        // active mark to visually distinguish it from the other options
        const selectedItem =
            await vsc.window.showQuickPick<SourceDescriptorQuickPickItem>(
                supportedSources.map((source) => ({
                    label: Ux.withActiveMark(
                        SourceDescriptor.label(source),
                        SourceDescriptor.equal(source, activeSource),
                    ),
                    source,
                })),
                {
                    title: "System Prompt Source",
                    placeHolder: "Select the system prompt source to be used",
                    ignoreFocusOut: true,
                },
            );

        // if the user selected a source,
        // extract it from the selected quick pick item
        const newSource = selectedItem?.source;

        // if the user selected a new source that is different from the
        // currently active one, persist the new source in the workspace
        // settings and show a confirmation message to the user. If the user
        // selected the currently active source or canceled the operation,
        // no changes are made and no message is shown
        if (newSource && !SourceDescriptor.equal(newSource, activeSource)) {
            await vsc.workspace
                .getConfiguration(CONFIG.ROOT)
                .update(
                    CONFIG.CUSTOM_SYSTEM_PROMPT_SOURCE,
                    newSource.type === "file" ? newSource.path : undefined,
                    vsc.ConfigurationTarget.Workspace,
                );

            vsc.window.showInformationMessage(
                "LectorGPT: Successfully selected the " +
                    (newSource.type === "file"
                        ? `custom system prompt "${newSource.path}".`
                        : "default system prompt."),
            );
        }

        // finally, return the selected source to the caller
        // (undefined when the user canceled the operation)
        return newSource;
    },

    //

    //

    /**
     * Resolves the active source by first checking the workspace settings for a
     * configured source. If an active source is already configured, it is
     * returned. If no active source is configured, the default asset source is
     * returned as a fallback to ensure that there is always an active source
     * available.
     *
     * @returns A promise that resolves to the active source.
     *
     * @author Samuel Lörtscher
     */
    resolveActiveSource: async (): Promise<SourceDescriptor> => {
        // the active source is always defined as there is
        // at least the asset source as a fallback
        return await getActiveSource();
    },

    //

    //

    /**
     * load the system prompt from the specified source.
     *
     * @param context The extension context.
     * @param source The source from which to load the system prompt.
     *
     * @returns A promise that resolves to the system prompt text
     * read from the parametric source.
     *
     * @author Samuel Lörtscher
     */
    loadActiveSystemPrompt: async (
        context: vsc.ExtensionContext,
        source: SourceDescriptor,
    ): Promise<string | undefined> => {
        // resolve the active workspace folder to determine
        // the base path for file sources
        const editor = vsc.window.activeTextEditor;
        const workspaceFolder =
            editor && vsc.workspace.getWorkspaceFolder(editor.document.uri);

        // if no active workspace folder is found, show an error message
        // to the user and return undefined to indicate that the system
        // prompt could not be loaded
        if (!workspaceFolder) {
            vsc.window.showErrorMessage(
                "LectorGPT: No active workspace folder found.",
            );

            return undefined;
        }

        // construct the URI of the system prompt file based on the source type.
        // For file sources, the URI is constructed by joining the workspace
        // folder URI with the relative path of the source. For asset sources,
        // the URI is constructed by joining the extension URI with the path to
        // the default system prompt asset
        const uri =
            source.type === "file"
                ? vsc.Uri.joinPath(workspaceFolder.uri, source.path)
                : vsc.Uri.joinPath(
                      context.extensionUri,
                      "assets",
                      "prompts",
                      "default.prompt.md",
                  );

        try {
            // read the system prompt file from the constructed
            // URI and return its content as a string.
            const data = await vsc.workspace.fs.readFile(uri);
            return Buffer.from(data).toString("utf8");
        } catch (exp: unknown) {
            // if the file cannot be read for any reason (e.g., it doesn't
            // exist, there are permission issues, etc.), an error message is
            // shown to the user and undefined is returned to indicate that the
            // system prompt could not be loaded
            vsc.window.showErrorMessage(
                Ux.withContext(
                    "LectorGPT: Failed to read the " +
                        (source.type === "file"
                            ? `custom system prompt file at "${uri.fsPath}"`
                            : "default system prompt"),
                    exp,
                ),
            );

            return undefined;
        }
    },
} as const;
