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
import { SECRETS } from "@lectorgpt/constants";
import { Vendor } from "@lectorgpt/types";
import { SecretManager, VendorQuickPickItem } from "@lectorgpt/managers";
import { VendorDescriptor } from "@lectorgpt/descriptors";
import { withSandbox, Stubs, stub } from "@lectorgpt/testkit";

//

// -----------------------------------------------------------------------------
// Stub Factory
// -----------------------------------------------------------------------------

//

const createTestStubs = (args: {
    sandbox: sinon.SinonSandbox;
    getOnSecretResult?: string;
    showQuickPickResult?: VendorQuickPickItem | undefined;
    showInputBoxResult?: string | undefined;
}) => {
    return {
        ...Stubs.context(args.sandbox, args.getOnSecretResult),
        ...Stubs.quickPick(args.sandbox, args.showQuickPickResult),
        ...Stubs.inputBox(args.sandbox, args.showInputBoxResult),
        ...Stubs.msgs(args.sandbox),
    };
};

//

// -----------------------------------------------------------------------------
// BDD Tests
// -----------------------------------------------------------------------------

//

describe("SecretManager", () => {
    const anySecretResult = "any-secret";
    const anyInputBoxResult = "any-input";
    const anyQuickPickResult = stub<VendorQuickPickItem>({
        label: "OpenAI API",
        vendor: "openai",
    });

    describe("registerNewApiKey", () => {
        it(
            "should query all api keys for the active vendors setup",
            withSandbox(async (sandbox) => {
                // --- arrange ---
                const vendors = VendorDescriptor.create(["openai", "google"]);
                const stubs = createTestStubs({
                    sandbox,
                    getOnSecretResult: anySecretResult,
                    showQuickPickResult: anyQuickPickResult,
                    showInputBoxResult: anyInputBoxResult,
                });

                // --- act ---
                await SecretManager.registerNewApiKey(stubs.context, vendors);

                // --- assert ---
                for (const vendor of vendors.setup) {
                    expect(stubs.getOnSecret).toHaveBeenCalledWith(
                        `${SECRETS.API_KEYS}.${vendor}`,
                    );
                }
            }),
        );

        it(
            "should prompt the user to select for which vendor to " +
                "register a new api key",
            withSandbox(async (sandbox) => {
                // --- arrange ---
                const vendors = VendorDescriptor.create(["openai", "google"]);
                const stubs = createTestStubs({
                    sandbox,
                    getOnSecretResult: "",
                    showQuickPickResult: anyQuickPickResult,
                    showInputBoxResult: anyInputBoxResult,
                });

                // --- act ---
                await SecretManager.registerNewApiKey(stubs.context, vendors);

                // --- assert ---
                expect(stubs.showQuickPick).toHaveBeenCalledOnceWith(
                    [
                        {
                            label: "Google API",
                            vendor: "google",
                            description: undefined,
                        },
                        {
                            label: "OpenAI API",
                            vendor: "openai",
                            description: undefined,
                        },
                    ] as unknown as vsc.QuickPickItem[],
                    {
                        title: "Register API key",
                        placeHolder:
                            "Select the vendor for which you want to " +
                            "register a new API key",
                        ignoreFocusOut: true,
                    },
                );
            }),
        );

        it(
            "should only present vendors that are part of " +
                "the active vendor setup",
            withSandbox(async (sandbox) => {
                // --- arrange ---
                const vendors = VendorDescriptor.create(["openai"]);
                const stubs = createTestStubs({
                    sandbox,
                    getOnSecretResult: "",
                    showQuickPickResult: anyQuickPickResult,
                    showInputBoxResult: anyInputBoxResult,
                });

                // --- act ---
                await SecretManager.registerNewApiKey(stubs.context, vendors);

                // --- assert ---
                expect(stubs.showQuickPick).toHaveBeenCalledOnceWith(
                    [
                        {
                            label: "OpenAI API",
                            vendor: "openai",
                            description: undefined,
                        },
                    ] as unknown as vsc.QuickPickItem[],
                    {
                        title: "Register API key",
                        placeHolder:
                            "Select the vendor for which you want to " +
                            "register a new API key",
                        ignoreFocusOut: true,
                    },
                );
            }),
        );

        it(
            "should mark vendors with existing api keys",
            withSandbox(async (sandbox) => {
                // --- arrange ---
                const vendors = VendorDescriptor.create(["openai"]);
                const stubs = createTestStubs({
                    sandbox,
                    getOnSecretResult: "given-secret",
                    showQuickPickResult: anyQuickPickResult,
                    showInputBoxResult: anyInputBoxResult,
                });

                // --- act ---
                await SecretManager.registerNewApiKey(stubs.context, vendors);

                // --- assert ---
                expect(stubs.showQuickPick).toHaveBeenCalledOnceWith(
                    [
                        {
                            label: "OpenAI API",
                            vendor: "openai",
                            description: "(will overwrite existing key)",
                        },
                    ] as unknown as vsc.QuickPickItem[],
                    {
                        title: "Register API key",
                        placeHolder:
                            "Select the vendor for which you want to " +
                            "register a new API key",
                        ignoreFocusOut: true,
                    },
                );
            }),
        );

        it(
            "should prompt the user to enter a new api key " +
                "for the selected vendor",
            withSandbox(async (sandbox) => {
                // --- arrange ---
                const vendors = VendorDescriptor.create(["openai"]);
                const stubs = createTestStubs({
                    sandbox,
                    getOnSecretResult: anySecretResult,
                    showQuickPickResult: anyQuickPickResult,
                    showInputBoxResult: anyInputBoxResult,
                });

                // --- act ---
                await SecretManager.registerNewApiKey(stubs.context, vendors);

                // --- assert ---
                expect(stubs.showInputBox).toHaveBeenCalledOnceWith({
                    prompt:
                        "Enter a new OpenAI API key " +
                        "(the active API key will be overwritten)",
                    password: true,
                    ignoreFocusOut: true,
                });
            }),
        );

        it(
            "should accept any non-empty string as a valid API key",
            withSandbox(async (sandbox) => {
                // --- arrange ---
                const vendors = VendorDescriptor.create(["openai"]);
                const stubs = createTestStubs({
                    sandbox,
                    getOnSecretResult: anySecretResult,
                    showQuickPickResult: anyQuickPickResult,
                    showInputBoxResult: undefined,
                });

                // --- act ---
                await SecretManager.registerNewApiKey(stubs.context, vendors);
                const call = stubs.showInputBox.firstCall;
                const result = call?.args[0]?.validateInput?.("any-key");

                // --- assert ---
                expect(result).toBe(null);
            }),
        );

        it(
            "should not accept an empty string as a valid API key",
            withSandbox(async (sandbox) => {
                // --- arrange ---
                const vendors = VendorDescriptor.create(["openai"]);
                const stubs = createTestStubs({
                    sandbox,
                    getOnSecretResult: anySecretResult,
                    showQuickPickResult: anyQuickPickResult,
                    showInputBoxResult: undefined,
                });

                // --- act ---
                await SecretManager.registerNewApiKey(stubs.context, vendors);
                const call = stubs.showInputBox.firstCall;
                const result = call?.args[0]?.validateInput?.("  ");

                // --- assert ---
                expect(result).toBe("API key cannot be empty");
            }),
        );

        it(
            "should persist and return the registered key " +
                "when it differs from the active one",
            withSandbox(async (sandbox) => {
                // --- arrange ---
                const vendors = VendorDescriptor.create(["openai"]);
                const stubs = createTestStubs({
                    sandbox,
                    getOnSecretResult: "",
                    showQuickPickResult: stub<VendorQuickPickItem>({
                        label: "OpenAI API",
                        vendor: "openai",
                    }),
                    showInputBoxResult: "given-input",
                });

                // --- act ---
                const result = await SecretManager.registerNewApiKey(
                    stubs.context,
                    vendors,
                );

                // --- assert ---
                expect(result).toBe("given-input");
                expect(stubs.storeOnSecret).toHaveBeenCalledOnceWith(
                    `${SECRETS.API_KEYS}.openai`,
                    "given-input",
                );

                expect(stubs.showErrorMsg).not.toHaveBeenCalled();
                expect(stubs.showInfoMsg).toHaveBeenCalledOnceWith(
                    "LectorGPT: Successfully registered a new OpenAI API key.",
                );
            }),
        );

        it(
            "should return but not persist the registered key " +
                "when it has not changed",
            withSandbox(async (sandbox) => {
                // --- arrange ---
                const vendors = VendorDescriptor.create(["openai"]);
                const stubs = createTestStubs({
                    sandbox,
                    getOnSecretResult: "given-secret",
                    showQuickPickResult: stub<VendorQuickPickItem>({
                        label: "OpenAI API",
                        vendor: "openai",
                    }),
                    showInputBoxResult: "given-secret",
                });

                // --- act ---
                const result = await SecretManager.registerNewApiKey(
                    stubs.context,
                    vendors,
                );

                // --- assert ---
                expect(result).toBe("given-secret");
                expect(stubs.storeOnSecret).not.toHaveBeenCalled();
                expect(stubs.showInfoMsg).not.toHaveBeenCalled();
                expect(stubs.showErrorMsg).not.toHaveBeenCalled();
            }),
        );

        it(
            "should return undefined when the vendor selection " +
                "process was canceled",
            withSandbox(async (sandbox) => {
                // --- arrange ---
                const vendors = VendorDescriptor.create(["openai"]);
                const stubs = createTestStubs({
                    sandbox,
                    getOnSecretResult: anySecretResult,
                    showQuickPickResult: undefined,
                    showInputBoxResult: anyInputBoxResult,
                });

                // --- act ---
                const result = await SecretManager.registerNewApiKey(
                    stubs.context,
                    vendors,
                );

                // --- assert ---
                expect(result).toBeUndefined();
                expect(stubs.showInputBox).not.toHaveBeenCalled();
                expect(stubs.storeOnSecret).not.toHaveBeenCalled();
                expect(stubs.showInfoMsg).not.toHaveBeenCalled();
                expect(stubs.showErrorMsg).not.toHaveBeenCalled();
            }),
        );

        it(
            "should return undefined when the registration " +
                "process was canceled",
            withSandbox(async (sandbox) => {
                // --- arrange ---
                const vendors = VendorDescriptor.create(["openai"]);
                const stubs = createTestStubs({
                    sandbox,
                    getOnSecretResult: anySecretResult,
                    showQuickPickResult: anyQuickPickResult,
                    showInputBoxResult: undefined,
                });

                // --- act ---
                const result = await SecretManager.registerNewApiKey(
                    stubs.context,
                    vendors,
                );

                // --- assert ---
                expect(result).toBeUndefined();
                expect(stubs.showInputBox).toHaveBeenCalledOnceWith({
                    prompt:
                        "Enter a new OpenAI API key " +
                        "(the active API key will be overwritten)",
                    password: true,
                    ignoreFocusOut: true,
                });

                expect(stubs.storeOnSecret).not.toHaveBeenCalled();
                expect(stubs.showInfoMsg).not.toHaveBeenCalled();
                expect(stubs.showErrorMsg).not.toHaveBeenCalled();
            }),
        );
    });

    //

    //

    describe("resolveActiveApiKeys", () => {
        it(
            "should query all api keys for the active vendors setup",
            withSandbox(async (sandbox) => {
                // --- arrange ---
                const vendors = VendorDescriptor.create(["openai", "google"]);
                const stubs = createTestStubs({
                    sandbox,
                    getOnSecretResult: anySecretResult,
                    showInputBoxResult: anyInputBoxResult,
                });

                // --- act ---
                await SecretManager.registerNewApiKey(stubs.context, vendors);

                // --- assert ---
                for (const vendor of vendors.setup) {
                    expect(stubs.getOnSecret).toHaveBeenCalledWith(
                        `${SECRETS.API_KEYS}.${vendor}`,
                    );
                }
            }),
        );

        it(
            "should return the active api keys without interaction when " +
                "an active api key for every vendor within the active " +
                "vendor setup exists",
            withSandbox(async (sandbox) => {
                // --- arrange ---
                const vendors = VendorDescriptor.create(["openai", "google"]);
                const stubs = createTestStubs({
                    sandbox,
                    getOnSecretResult: "given-secret",
                    showInputBoxResult: anyInputBoxResult,
                });

                // --- act ---
                const result = await SecretManager.resolveActiveApiKeys(
                    stubs.context,
                    vendors,
                    "any-cmd",
                );

                // --- assert ---
                expect(result).toStrictEqual(
                    new Map<Vendor, string>([
                        ["openai", "given-secret"],
                        ["google", "given-secret"],
                    ]),
                );
            }),
        );

        it(
            "should prompt the user to register a new api key for every " +
                "vendor in the active vendor setup for which no api key exists.",
            withSandbox(async (sandbox) => {
                // --- arrange ---
                const vendors = VendorDescriptor.create(["openai", "google"]);
                const stubs = createTestStubs({
                    sandbox,
                    getOnSecretResult: "",
                    showInputBoxResult: anyInputBoxResult,
                });

                // --- act ---
                await SecretManager.resolveActiveApiKeys(
                    stubs.context,
                    vendors,
                    "any-cmd",
                );

                // --- assert ---
                expect(stubs.showQuickPick).not.toHaveBeenCalled();
                expect(stubs.showInputBox).toHaveBeenNthCalledWith(0, {
                    prompt: "Enter a new Google API key",
                    password: true,
                    ignoreFocusOut: true,
                });

                expect(stubs.showInputBox).toHaveBeenNthCalledWith(1, {
                    prompt: "Enter a new OpenAI API key",
                    password: true,
                    ignoreFocusOut: true,
                });
            }),
        );

        it(
            "should abort the entire operation without interaction when " +
                "the user canceled the registration of any api key.",
            withSandbox(async (sandbox) => {
                // --- arrange ---
                const vendors = VendorDescriptor.create(["openai", "google"]);
                const stubs = createTestStubs({
                    sandbox,
                    getOnSecretResult: "",
                    showInputBoxResult: undefined,
                });

                // --- act ---
                await SecretManager.resolveActiveApiKeys(
                    stubs.context,
                    vendors,
                    "any-cmd",
                );

                // --- assert ---
                expect(stubs.showInputBox).toHaveBeenCalledOnceWith({
                    prompt: "Enter a new Google API key",
                    password: true,
                    ignoreFocusOut: true,
                });
            }),
        );

        it(
            "should report an error and return undefined when the user " +
                "canceled the registration of any api key.",
            withSandbox(async (sandbox) => {
                // --- arrange ---
                const vendors = VendorDescriptor.create(["openai", "google"]);
                const stubs = createTestStubs({
                    sandbox,
                    getOnSecretResult: "",
                    showInputBoxResult: undefined,
                });

                // --- act ---
                const result = await SecretManager.resolveActiveApiKeys(
                    stubs.context,
                    vendors,
                    "any-cmd",
                );

                // --- assert ---
                expect(result).toBeUndefined();
                expect(stubs.showErrorMsg).toHaveBeenCalledWith(
                    'LectorGPT: The command "any-cmd" requires a valid API ' +
                        "key for every active vendor. Please try again and " +
                        "register a valid API key for every vendor in the " +
                        "active vendor setup to proceed.",
                );
            }),
        );
    });

    //

    //

    describe("unregisterApiKey", () => {
        it(
            "should query all api keys for the active vendors setup",
            withSandbox(async (sandbox) => {
                // --- arrange ---
                const vendors = VendorDescriptor.create(["openai", "google"]);
                const stubs = createTestStubs({
                    sandbox,
                    getOnSecretResult: anySecretResult,
                    showQuickPickResult: anyQuickPickResult,
                });

                // --- act ---
                await SecretManager.registerNewApiKey(stubs.context, vendors);

                // --- assert ---
                for (const vendor of vendors.setup) {
                    expect(stubs.getOnSecret).toHaveBeenCalledWith(
                        `${SECRETS.API_KEYS}.${vendor}`,
                    );
                }
            }),
        );

        it(
            "should prompt the user for which vendor to unregister the api key",
            withSandbox(async (sandbox) => {
                // --- arrange ---
                const stubs = createTestStubs({
                    sandbox,
                    getOnSecretResult: "given-secret",
                    showQuickPickResult: anyQuickPickResult,
                });

                // --- act ---
                await SecretManager.unregisterApiKey(stubs.context);

                // --- assert ---
                expect(stubs.showQuickPick).toHaveBeenCalledOnceWith(
                    [
                        {
                            label: "Google API",
                            vendor: "google",
                            description: undefined,
                        },
                        {
                            label: "OpenAI API",
                            vendor: "openai",
                            description: undefined,
                        },
                    ] as unknown as vsc.QuickPickItem[],
                    {
                        title: "Unregister API key",
                        placeHolder:
                            "Select the vendor for which you want to " +
                            "unregister it's existing API key",
                        ignoreFocusOut: true,
                    },
                );
            }),
        );

        it(
            "should delete the API key for the selected vendor",
            withSandbox(async (sandbox) => {
                // --- arrange ---
                const stubs = createTestStubs({
                    sandbox,
                    getOnSecretResult: "given-secret",
                    showQuickPickResult: stub<VendorQuickPickItem>({
                        label: "OpenAI API",
                        vendor: "openai",
                    }),
                });

                // --- act ---
                await SecretManager.unregisterApiKey(stubs.context);

                // --- assert ---
                expect(stubs.deleteOnSecret).toHaveBeenCalledOnceWith(
                    `${SECRETS.API_KEYS}.openai`,
                );

                expect(stubs.showInfoMsg).toHaveBeenCalledWith(
                    "LectorGPT: Successfully unregistered the active " +
                        "OpenAI API key.",
                );
            }),
        );

        it(
            "should abort the operation silently when the " +
                "selection process was canceled",
            withSandbox(async (sandbox) => {
                // --- arrange ---
                const stubs = createTestStubs({
                    sandbox,
                    getOnSecretResult: "given-secret",
                    showQuickPickResult: undefined,
                });

                // --- act ---
                await SecretManager.unregisterApiKey(stubs.context);

                // --- assert ---
                expect(stubs.deleteOnSecret).not.toHaveBeenCalled();
                expect(stubs.showInfoMsg).not.toHaveBeenCalled();
                expect(stubs.showErrorMsg).not.toHaveBeenCalled();
            }),
        );

        it(
            "should report an error when no active API key exists",
            withSandbox(async (sandbox) => {
                // --- arrange ---
                const stubs = createTestStubs({
                    sandbox,
                    getOnSecretResult: "",
                    showQuickPickResult: anyQuickPickResult,
                });

                // --- act ---
                await SecretManager.unregisterApiKey(stubs.context);

                // --- assert ---
                expect(stubs.deleteOnSecret).not.toHaveBeenCalled();
                expect(stubs.showErrorMsg).toHaveBeenCalledWith(
                    "LectorGPT: No active API keys exist.",
                );
            }),
        );
    });
});
