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
import { Vendor } from "@lectorgpt/types";
import { VendorDescriptor } from "@lectorgpt/descriptors";
import { Guards, Ux } from "@lectorgpt/utils";

//

// -----------------------------------------------------------------------------
// Module Scoped (Private) Types & Functions
// -----------------------------------------------------------------------------

//

/**
 * Returns an array of all supported vendor setups that can be
 * activated by the user. This is currently hardcoded to the three possible
 * combinations of OpenAI and Google, but can be easily extended in the future
 * when more vendors are supported.
 *
 * @returns An array of supported vendor setups.
 *
 * @author Samuel Lörtscher
 */
const resolveSupportedVendors = (): VendorDescriptor[] => {
    return [
        ["openai" as const],
        ["google" as const],
        ["openai" as const, "google" as const],
    ].map(VendorDescriptor.create);
};

//

//

/**
 * Returns the active vendor setup from the workspace settings.
 *
 * @returns A promise that resolves to the active vendor setup or `undefined`
 * when no vendor setup was configured.
 *
 * @author Samuel Lörtscher
 */
const getActiveVendors = async (): Promise<VendorDescriptor | undefined> => {
    // read the active vendor-ids from the workspace settings
    const activeVendorIds = vsc.workspace
        .getConfiguration(CONFIG.ROOT)
        .get<Vendor[]>(CONFIG.VENDORS);

    // if there are active vendor-ids configured, create a VendorDescriptor
    // instance from them and return it. Otherwise, return undefined to signal
    // that no active vendor setup is configured
    return Guards.isNonEmpty(activeVendorIds)
        ? VendorDescriptor.create(activeVendorIds)
        : undefined;
};

//

// -----------------------------------------------------------------------------
// Exported Public Interface
// -----------------------------------------------------------------------------

//

/**
 * The VendorQuickPickItem is a specialized {@link vsc.QuickPickItem} that
 * includes a `vendors` property containing the {@link VendorDescriptor}
 * associated with the quick pick item.
 *
 * @author Samuel Lörtscher
 */
export type VendorDescriptorQuickPickItem = vsc.QuickPickItem & {
    vendors: VendorDescriptor;
};

//

//

/**
 * The VendorManager is responsible for managing the vendor setups, including
 * resolving the active vendor setup, prompting the user to select a vendor
 * setup, and persisting the selected vendor setup in the workspace settings.
 *
 * @author Samuel Lörtscher
 */
export const VendorManager = {
    /**
     * Selects a new active vendor setup by prompting the user with
     * a quick pick of all supported vendor setups. The selected vendor setup is
     * then persisted in the workspace settings and returned to the caller.
     *
     * @returns A promise that resolves to the selected vendor setup, or
     * `undefined` when the operation was canceled by the user.
     *
     * @author Samuel Lörtscher
     */
    selectActiveVendors: async (): Promise<VendorDescriptor | undefined> => {
        // resolve the supported and active vendor setups to determine which
        // vendor setups can be selected by the user and which one is currently
        // active to properly annotate the quick pick items
        const supportedVendors = resolveSupportedVendors();
        const activeVendors = await getActiveVendors();

        // prompt the user to select a new active vendor setup from the list of
        // supported vendor setups. The currently active vendor setup is
        // annotated with an active mark to visually distinguish it from the
        // other options
        const selectedItem =
            await vsc.window.showQuickPick<VendorDescriptorQuickPickItem>(
                supportedVendors.map((vendors) => ({
                    label: Ux.withActiveMark(
                        VendorDescriptor.label(vendors),
                        VendorDescriptor.equal(vendors, activeVendors),
                    ),
                    vendors,
                })),
                {
                    title: "Vendor Setup Activation",
                    placeHolder: "Select which vendor setup to activate",
                    ignoreFocusOut: true,
                },
            );

        // if the user selected a new vendor setup,
        // extract it from the selected quick pick item
        const newVendors = selectedItem?.vendors;

        // if the user selected a new vendor setup that is different from the
        // currently active one, persist the new vendor setup in the workspace
        // settings and show a confirmation message to the user. If the user
        // selected the currently active vendor setup or canceled the operation,
        // no changes are made and no message is shown
        if (newVendors && !VendorDescriptor.equal(newVendors, activeVendors)) {
            await vsc.workspace
                .getConfiguration(CONFIG.ROOT)
                .update(
                    CONFIG.VENDORS,
                    newVendors?.setup,
                    vsc.ConfigurationTarget.Workspace,
                );

            vsc.window.showInformationMessage(
                `LectorGPT: Successfully activated ${VendorDescriptor.label(
                    newVendors,
                )}.`,
            );
        }

        // finally, return the selected vendor setup to the caller
        // (undefined when the user canceled the operation)
        return newVendors;
    },

    //

    //

    /**
     * Resolves the active vendor setup for the given command. If an active
     * vendor setup is already configured, it is returned without interaction.
     * Otherwise, the user is prompted to select a new active vendor setup ad
     * hoc. If the user cancels the operation, undefined is returned.
     *
     * @param cmd - The command that requires the active vendor setup.
     *
     * @returns A promise that resolves to the active vendor setup or
     * `undefined` when no vendor setup was configured and the selection was
     * canceled by the user.
     *
     * @author Samuel Lörtscher
     */
    resolveActiveVendors: async (
        cmd: string,
    ): Promise<VendorDescriptor | undefined> => {
        // first, try to resolve the active vendor setup from the workspace
        // settings. If an active vendor setup is already configured, return it
        // immediately without any user interaction. This allows for a seamless
        // experience when the user has already set up his preferred vendor
        // configuration
        const activeVendors = await getActiveVendors();
        if (activeVendors) {
            return activeVendors;
        }

        // when there is no active vendor setup configured, the user is prompted
        // to select a new active vendor setup ad hoc. This ensures that the
        // user can still use the command even if he hasn't set up a vendor
        // configuration beforehand, while also guiding him to set up a vendor
        // configuration for future use. If the user cancels the selection, no
        // vendor setup is returned and the command execution can be gracefully
        // aborted
        const newVendors = await VendorManager.selectActiveVendors();
        if (!newVendors) {
            vsc.window.showErrorMessage(
                `LectorGPT: The command "${cmd}" requires at least ` +
                    "one activated vendor. Please try again and select " +
                    "at least one vendor to proceed.",
            );
        }

        // finally return the resolved vendor setup
        // (undefined when the user canceled the operation)
        return newVendors;
    },
} as const;
