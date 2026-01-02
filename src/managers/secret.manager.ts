// -----------------------------------------------------------------------------
// Author:  Samuel Lörtscher
// Date:    25 January 2026
// Project: LectorGPT: LaTeX text refinement powered by OpenAI and Google
// -----------------------------------------------------------------------------

//

// import all required third party modules
import * as vsc from "vscode";

// import all required project modules
import { SECRETS } from "@lectorgpt/constants";
import { Vendor, Vendors } from "@lectorgpt/types";
import { VendorDescriptor } from "@lectorgpt/descriptors";
import { Guards, Ux } from "@lectorgpt/utils";

//

// -----------------------------------------------------------------------------
// Module Scoped (Private) Types & Functions
// -----------------------------------------------------------------------------

//

/**
 * Collects the active API keys for all vendors from the secret storage.
 * Vendors that do not have an active API key will be filtered out and
 * are thus not included in the returned map.
 *
 * @param context - The extension context containing the secrets storage.
 *
 * @returns A promise that resolves to a map mapping each vendor
 * to its active API key.
 *
 * @author Samuel Lörtscher
 */
const collectActiveApiKeys = async (
    context: vsc.ExtensionContext,
): Promise<Map<Vendor, string>> => {
    // query the secret storage for an active API key for each vendor
    // (those that do not have an active API key will yield `undefined`)
    const apiKeys = await Promise.all(
        Vendors.all().map(async (vendor) => {
            const secret = `${SECRETS.API_KEYS}.${vendor}`;
            const apiKey = await context.secrets.get(secret);
            return apiKey ? ([vendor, apiKey] as const) : undefined;
        }),
    );

    // finally return a map mapping each vendor to its active API key
    // (only retain those vendors that have an active API key)
    return new Map(apiKeys.filter(Guards.isDefined));
};

//

//

/**
 * Prompts the user to select a vendor from a list of vendors. The selection
 * is used for either registering a new API key or unregistering an existing
 * one, depending on the provided intent.
 *
 * @param vendors - The list of vendors to select from.
 * @param activeApiKeys - A map of currently active API keys.
 * @param intent - The intent of the selection, either "registration" or
 *                 "unregistration".
 *
 * @returns A promise that resolves to the selected vendor or `undefined`
 * when the operation was canceled.
 *
 * @author Samuel Lörtscher
 */
const selectVendor = async (
    vendors: Vendor[],
    activeApiKeys: Map<Vendor, string>,
    intent: "registration" | "unregistration",
): Promise<Vendor | undefined> => {
    // prompt the user to select for which vendor an API key should be
    // registered/unregistered. The quick pick items are annotated with the
    // currently active API keys to provide additional context to the user and
    // to prevent accidental overwrites/unregistrations
    const selectedItem = await vsc.window.showQuickPick<VendorQuickPickItem>(
        vendors.sort().map((vendor) => ({
            label: Vendor.label(vendor),
            description:
                intent === "registration" && activeApiKeys.has(vendor)
                    ? "(will overwrite existing key)"
                    : undefined,
            vendor,
        })),
        {
            title:
                intent === "registration"
                    ? "Register API key"
                    : "Unregister API key",
            placeHolder: `Select the vendor for which you want to ${
                intent === "registration"
                    ? "register a new "
                    : "unregister it's existing "
            }API key`,
            ignoreFocusOut: true,
        },
    );

    // finally return the selected vendor
    // (undefined when the user canceled the quick pick)
    return selectedItem?.vendor;
};

//

//

/**
 * Prompts the user to register a new API key for a particular vendor.
 * The user is informed about the currently active API key (if any) to prevent
 * accidental overwrites. When the user confirms the registration of a new API
 * key, the old key is replaced with the new one.
 *
 * @param context - The extension context containing the secrets storage.
 * @param vendor - The vendor for which a new API key should be registered.
 * @param activeApiKey - The currently active API key for that vendor.
 *
 * @returns A promise that resolves to the newly registered API key or
 * `undefined` when the operation was canceled.
 *
 * @author Samuel Lörtscher
 */
const registerNewApiKeyForVendor = async (
    context: vsc.ExtensionContext,
    vendor: Vendor,
    activeApiKey: string | undefined,
): Promise<string | undefined> => {
    // prompt the user to register a new API key for the selected vendor. The
    // prompt is annotated with a warning when an active API key already exists
    // to prevent accidental overwrites. The input box is masked and validates
    // that the entered API key is not empty
    const newApiKey = await vsc.window.showInputBox({
        prompt: Ux.withConditionalWarning(
            `Enter a new ${Vendor.label(vendor)} key`,
            activeApiKey !== undefined,
            "the active API key will be overwritten",
        ),
        password: true,
        ignoreFocusOut: true,
        validateInput: (value: string) => {
            return value.trim() ? null : "API key cannot be empty";
        },
    });

    // if the user selected a new API key that is different from the
    // currently active one, persist the new API key in the secrets storage
    // and show a confirmation message to the user. If the user
    // selected the currently active API key or canceled the operation,
    // no changes are made and no message is shown
    if (newApiKey && newApiKey !== activeApiKey) {
        // store the new API key in the secrets storage
        const secret = `${SECRETS.API_KEYS}.${vendor}`;
        await context.secrets.store(secret, newApiKey);

        vsc.window.showInformationMessage(
            `LectorGPT: Successfully registered a new ${Vendor.label(
                vendor,
            )} key.`,
        );
    }

    // finally return the new API key to the caller
    // (undefined when the user canceled the operation)
    return newApiKey;
};

//

// -----------------------------------------------------------------------------
// Exported Public Interface
// -----------------------------------------------------------------------------

//

/**
 * The VendorQuickPickItem is a specialized {@link vsc.QuickPickItem} that
 * includes a `vendor` property containing the {@link Vendor} associated with
 * the quick pick item.
 *
 * @author Samuel Lörtscher
 */
export type VendorQuickPickItem = vsc.QuickPickItem & {
    vendor: Vendor;
};

//

//

/**
 * The SecretManager is responsible for managing the API keys for the vendors,
 * including registering new API keys, unregistering existing ones, and
 * resolving the active API keys for the active vendors.
 *
 * @author Samuel Lörtscher
 */
export const SecretManager = {
    /**
     * Prompts the user to register a new API key for one of the active vendors.
     * The user is first prompted to select for which vendor a new API key
     * should be registered and then to enter the new API key. The user is
     * informed about the currently active API key (if any) to prevent
     * accidental overwrites. When the user confirms the registration of a
     * new API key, the old key is replaced with the new one.
     *
     * @param context - The extension context containing the secrets storage.
     * @param vendors - The active vendors descriptor.
     *
     * @returns A promise that resolves to the newly registered API key or
     * `undefined` when the operation was canceled by the user.
     *
     * @author Samuel Lörtscher
     */
    registerNewApiKey: async (
        context: vsc.ExtensionContext,
        vendors: VendorDescriptor,
    ): Promise<string | undefined> => {
        // a map of all active API keys alongside their respective vendors has
        // to be collected to allow the user to select for which vendor a new
        // API key should be registered and to provide context about the
        // currently active API keys in the selection and registration prompts
        const activeApiKeys = await collectActiveApiKeys(context);
        const selectedVendor = await selectVendor(
            vendors.setup,
            activeApiKeys,
            "registration",
        );

        // abort the operation when the user canceled the selection of a vendor
        if (!selectedVendor) {
            return undefined;
        }

        // prompt the user to enter a new API key for the selected vendor and
        // register it in the secrets storage. The user is informed about the
        // currently active API key (if any) to prevent accidental overwrites.
        const newApiKey = await registerNewApiKeyForVendor(
            context,
            selectedVendor,
            activeApiKeys.get(selectedVendor),
        );

        // finally return the new API key
        // (undefined when the user canceled the operation)
        return newApiKey;
    },

    //

    //

    /**
     * Resolves the active API keys for the given active vendors.
     * For each active vendor, it is checked if an active API key is already
     * configured. If an active API key for a vendor exists, it is included
     * in the returned map. Otherwise, the user is prompted to register a new
     * API key for that vendor ad hoc. If the user cancels the registration
     * for any of the active vendors, the entire operation is aborted and
     * `undefined` is returned.
     *
     * @param context - The extension context containing the secrets storage.
     * @param vendors - The active vendors descriptor.
     * @param cmd - The command that requires the active vendors.
     *
     * @returns A promise that resolves to a map of all active API keys
     * alongside their respective vendors or `undefined` when not all API keys
     * were configured and registration was canceled by the user.
     *
     * @author Samuel Lörtscher
     */
    resolveActiveApiKeys: async (
        context: vsc.ExtensionContext,
        vendors: VendorDescriptor,
        cmd: string,
    ): Promise<Map<Vendor, string> | undefined> => {
        // a map of all active API keys alongside their respective vendors has
        // to be collected to allow the user to register new API keys for the
        // active vendors that do not have an active API key yet and to provide
        // context about the currently active API keys in the registration
        // prompts
        const activeApiKeys = await collectActiveApiKeys(context);
        const resolvedApiKeys = new Map<Vendor, string>();

        // iterate over all active vendors
        for (const vendor of vendors.setup) {
            // check if an active API key for the current vendor exists.
            const activeApiKey = activeApiKeys.get(vendor);

            // when an active API key for the current vendor exists, include it
            // into the map of resolved API keys and continue with the next
            // vendor. This allows for a seamless experience when the user has
            // already set up an API key for the current vendor
            if (activeApiKey) {
                resolvedApiKeys.set(vendor, activeApiKey);
                continue;
            }

            // when there is no active API key for the current vendor, the user
            // is prompted to register a new API key for that vendor ad hoc.
            // This ensures that the user can still use the command even if he
            // hasn't set up API keys for all active vendors beforehand, while
            // also guiding him to set up the necessary API keys for future use
            const newApiKey = await registerNewApiKeyForVendor(
                context,
                vendor,
                activeApiKey,
            );

            // if the user cancels the registration for any of the active
            // vendors, the entire operation is aborted and `undefined` is
            // returned. This is because the command execution cannot proceed
            // without valid API keys for all active vendors, and it is better
            // to abort the operation gracefully than to proceed with an
            // incomplete configuration
            if (!newApiKey) {
                break;
            }

            // update the map of resolved API keys
            resolvedApiKeys.set(vendor, newApiKey);
        }

        // if there is at least one active vendor that does not have a valid API
        // key after the resolution process, report an error and abort the
        // operation. This is a final guard to ensure that the command execution
        // does not proceed with an incomplete configuration
        if (vendors.setup.some((key) => !resolvedApiKeys.has(key))) {
            vsc.window.showErrorMessage(
                `LectorGPT: The command "${cmd}" requires a ` +
                    "valid API key for every active vendor. Please try again " +
                    "and register a valid API key for every vendor in the " +
                    "active vendor setup to proceed.",
            );

            return undefined;
        }

        // finally return the map of resolved API keys
        // (each active vendor is guaranteed to have a valid API
        // key at this point, so the map is complete)
        return resolvedApiKeys;
    },

    //

    //

    /**
     * Unregisters an active API key for a particular vendor. The user is
     * prompted to select for which vendor the API key should be unregistered.
     * If the user  cancels the selection, the operation is aborted. Otherwise,
     * the selected API key is unregistered from the secrets storage.
     *
     * @param context - The extension context containing the secrets storage.
     *
     * @returns A promise that resolves when either an API key has been
     * unregistered or the operation was aborted.
     *
     * @author Samuel Lörtscher
     */
    unregisterApiKey: async (context: vsc.ExtensionContext): Promise<void> => {
        // a map of all active API keys alongside their respective vendors has
        // to be collected to allow the user to select for which vendor an API
        // key should be unregistered and to provide context about the currently
        // active API keys in the selection prompt
        const activeApiKeys = await collectActiveApiKeys(context);

        // if no active API keys exist, report an error and abort the operation
        if (activeApiKeys.size === 0) {
            vsc.window.showErrorMessage("LectorGPT: No active API keys exist.");
            return;
        }

        // prompt the user to select for which
        // vendor the API key should be unregistered
        const selectedVendor = await selectVendor(
            [...activeApiKeys.keys()],
            activeApiKeys,
            "unregistration",
        );

        // if the user canceled the selection, abort the operation
        if (!selectedVendor) {
            return;
        }

        // when the user selected a vendor, unregister the corresponding API key
        // from the secrets storage and show a confirmation message to the user
        const secret = `${SECRETS.API_KEYS}.${selectedVendor}`;
        await context.secrets.delete(secret);

        vsc.window.showInformationMessage(
            `LectorGPT: Successfully unregistered the active ${Vendor.label(
                selectedVendor,
            )} key.`,
        );
    },
} as const;
