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
import { Vendor, Vendors } from "@lectorgpt/types";
import { VendorDescriptor } from "@lectorgpt/descriptors";
import {
    VendorManager,
    VendorDescriptorQuickPickItem,
} from "@lectorgpt/managers";
import { withSandbox, stub, Stubs } from "@lectorgpt/testkit";

//

// -----------------------------------------------------------------------------
// Stub Factory
// -----------------------------------------------------------------------------

//

const createTestStubs = (args: {
    sandbox: sinon.SinonSandbox;
    getOnConfigResult?: Vendor[] | undefined;
    showQuickPickResult?: VendorDescriptorQuickPickItem | undefined;
}) => {
    return {
        ...Stubs.msgs(args.sandbox),
        ...Stubs.config(args.sandbox, args.getOnConfigResult ?? []),
        ...Stubs.quickPick(args.sandbox, args.showQuickPickResult),
    };
};

//

// -----------------------------------------------------------------------------
// BDD Tests
// -----------------------------------------------------------------------------

//

describe("VendorManager", () => {
    const anyConfigResult = Vendors.openai();
    const anyQuickPickResult = stub<VendorDescriptorQuickPickItem>({
        label: "OpenAI API",
        vendors: VendorDescriptor.create(Vendors.openai()),
    });

    describe("selectActiveVendors", () => {
        it(
            "should query the active vendor setup",
            withSandbox(async (sandbox) => {
                // --- arrange ---
                const stubs = createTestStubs({
                    sandbox,
                    getOnConfigResult: anyConfigResult,
                    showQuickPickResult: anyQuickPickResult,
                });

                // --- act ---
                await VendorManager.selectActiveVendors();

                // --- assert ---
                expect(stubs.getOnConfig).toHaveBeenCalledOnceWith(
                    CONFIG.VENDORS,
                );
            }),
        );

        it(
            "should prompt the user to select a new vendor setup",
            withSandbox(async (sandbox) => {
                // --- arrange ---
                const stubs = createTestStubs({
                    sandbox,
                    getOnConfigResult: Vendors.none(),
                    showQuickPickResult: anyQuickPickResult,
                });

                // --- act ---
                await VendorManager.selectActiveVendors();

                // --- assert ---
                expect(stubs.showQuickPick).toHaveBeenCalledOnceWith(
                    [
                        {
                            label: "OpenAI API only",
                            vendors: VendorDescriptor.create(Vendors.openai()),
                        },
                        {
                            label: "Google API only",
                            vendors: VendorDescriptor.create(Vendors.google()),
                        },
                        {
                            label: "OpenAI API & Google API",
                            vendors: VendorDescriptor.create(Vendors.all()),
                        },
                    ],
                    {
                        title: "Vendor Setup Activation",
                        placeHolder: "Select which vendor setup to activate",
                    },
                );
            }),
        );

        it(
            "should mark the active vendor setup",
            withSandbox(async (sandbox) => {
                // --- arrange ---
                const stubs = createTestStubs({
                    sandbox,
                    getOnConfigResult: Vendors.openai(),
                    showQuickPickResult: anyQuickPickResult,
                });

                // --- act ---
                await VendorManager.selectActiveVendors();

                // --- assert ---
                expect(stubs.showQuickPick).toHaveBeenCalledOnceWith(
                    [
                        {
                            label: "✓  OpenAI API only",
                            vendors: VendorDescriptor.create(Vendors.openai()),
                        },
                        {
                            label: "Google API only",
                            vendors: VendorDescriptor.create(Vendors.google()),
                        },
                        {
                            label: "OpenAI API & Google API",
                            vendors: VendorDescriptor.create(Vendors.all()),
                        },
                    ],
                    {
                        title: "Vendor Setup Activation",
                        placeHolder: "Select which vendor setup to activate",
                    },
                );
            }),
        );

        it(
            "should persist and return the selected vendor setup " +
                "when it differs from the active one",
            withSandbox(async (sandbox) => {
                // --- arrange ---
                const vendors = VendorDescriptor.create(Vendors.openai());
                const stubs = createTestStubs({
                    sandbox,
                    getOnConfigResult: Vendors.none(),
                    showQuickPickResult: stub<VendorDescriptorQuickPickItem>({
                        label: "OpenAI API only",
                        vendors,
                    }),
                });

                // --- act ---
                const result = await VendorManager.selectActiveVendors();

                // --- assert ---
                expect(result).toBe(vendors);
                expect(stubs.updateOnConfig).toHaveBeenCalledOnceWith(
                    CONFIG.VENDORS,
                    Vendors.openai(),
                    vsc.ConfigurationTarget.Workspace,
                );

                expect(stubs.showErrorMsg).not.toHaveBeenCalled();
                expect(stubs.showInfoMsg).toHaveBeenCalledOnceWith(
                    "LectorGPT: Successfully activated OpenAI API only.",
                );
            }),
        );

        it(
            "should return but not persist the selected " +
                "vendor setup when it has not changed",
            withSandbox(async (sandbox) => {
                // --- arrange ---
                const vendors = VendorDescriptor.create(Vendors.openai());
                const stubs = createTestStubs({
                    sandbox,
                    getOnConfigResult: Vendors.openai(),
                    showQuickPickResult: stub<VendorDescriptorQuickPickItem>({
                        label: "OpenAI API only",
                        vendors,
                    }),
                });

                // --- act ---
                const result = await VendorManager.selectActiveVendors();

                // --- assert ---
                expect(result).toBe(vendors);
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
                    showQuickPickResult: undefined,
                });

                // --- act ---
                const result = await VendorManager.selectActiveVendors();

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

    describe("resolveActiveVendors", () => {
        it(
            "should query the active vendor setup",
            withSandbox(async (sandbox) => {
                // --- arrange ---
                const stubs = createTestStubs({
                    sandbox,
                    getOnConfigResult: anyConfigResult,
                });

                // --- act ---
                await VendorManager.resolveActiveVendors("any-cmd");

                // --- assert ---
                expect(stubs.getOnConfig).toHaveBeenCalledOnceWith(
                    CONFIG.VENDORS,
                );
            }),
        );

        it(
            "should return the active vendor setup without " +
                "interaction when an active vendor setup exists",
            withSandbox(async (sandbox) => {
                // --- arrange ---
                const stubs = createTestStubs({
                    sandbox,
                    getOnConfigResult: Vendors.openai(),
                });

                // --- act ---
                const result =
                    await VendorManager.resolveActiveVendors("any-cmd");

                // --- assert ---
                expect(result).toStrictEqual(
                    VendorDescriptor.create(Vendors.openai()),
                );

                expect(stubs.showQuickPick).not.toHaveBeenCalled();
                expect(stubs.updateOnConfig).not.toHaveBeenCalled();
                expect(stubs.showInfoMsg).not.toHaveBeenCalled();
                expect(stubs.showErrorMsg).not.toHaveBeenCalled();
            }),
        );

        it(
            "should prompt the user to select a new vendor setup ad hoc " +
                "when no active vendor setup exists",
            withSandbox(async (sandbox) => {
                // --- arrange ---
                const stubs = createTestStubs({
                    sandbox,
                    getOnConfigResult: Vendors.none(),
                });

                // --- act ---
                await VendorManager.resolveActiveVendors("any-cmd");

                // --- assert ---
                expect(stubs.showQuickPick).toHaveBeenCalledOnceWith(
                    [
                        {
                            label: "OpenAI API only",
                            vendors: VendorDescriptor.create(Vendors.openai()),
                        },
                        {
                            label: "Google API only",
                            vendors: VendorDescriptor.create(Vendors.google()),
                        },
                        {
                            label: "OpenAI API & Google API",
                            vendors: VendorDescriptor.create(Vendors.all()),
                        },
                    ],
                    {
                        title: "Vendor Setup Activation",
                        placeHolder: "Select which vendor setup to activate",
                    },
                );
            }),
        );

        it(
            "should report an error and return undefined when the selection " +
                "process was canceled and no active vendor setup exists",
            withSandbox(async (sandbox) => {
                // --- arrange ---
                const stubs = createTestStubs({
                    sandbox,
                    getOnConfigResult: Vendors.none(),
                    showQuickPickResult: undefined,
                });

                // --- act ---
                const result =
                    await VendorManager.resolveActiveVendors("any-cmd");

                // --- assert ---
                expect(result).toBeUndefined();
                expect(stubs.updateOnConfig).not.toHaveBeenCalled();
                expect(stubs.showInfoMsg).not.toHaveBeenCalled();
                expect(stubs.showErrorMsg).toHaveBeenCalledOnceWith(
                    'LectorGPT: The command "any-cmd" requires at least ' +
                        "one activated vendor. Please try again and select " +
                        "at least one vendor to proceed.",
                );
            }),
        );
    });
});
