// -----------------------------------------------------------------------------
// Author:  Samuel Lörtscher
// Date:    25 January 2026
// Project: LectorGPT: LaTeX text refinement powered by OpenAI and Google
// -----------------------------------------------------------------------------

//

// import all required third party modules
import type { OpenAI } from "openai";
import type { GoogleGenerativeAI } from "@google/generative-ai";
import type { SinonSandbox } from "sinon";
import expect from "expect";

// import all required project modules
import { Vendor, Vendors } from "@lectorgpt/types";
import { VendorDescriptor } from "@lectorgpt/descriptors";
import { OpenAIModelProvider, GoogleModelProvider } from "@lectorgpt/providers";
import { ProviderFactory, ClientFactory } from "@lectorgpt/factories";
import { withSandbox, stub } from "@lectorgpt/testkit";

type StubsParams = {
    sandbox: SinonSandbox;
    createOpenAIClientResult?: OpenAI | undefined;
    createGoogleClientResult?: GoogleGenerativeAI | undefined;
};

const createTestStubs = ({
    sandbox,
    createOpenAIClientResult,
    createGoogleClientResult,
}: StubsParams) => {
    return {
        createOpenAIClient: sandbox
            .stub(ClientFactory, "createOpenAIClient")
            .resolves(createOpenAIClientResult),

        createGoogleClient: sandbox
            .stub(ClientFactory, "createGoogleClient")
            .resolves(createGoogleClientResult),
    };
};

describe("ProviderFactory", () => {
    describe("createProviderMap", () => {
        const openAIClient = stub<OpenAI>({});
        const googleGenerativeAIClient = stub<GoogleGenerativeAI>({});

        it(
            "should return a map containing an appropriate model " +
                "provider for each vendor",
            withSandbox(async (sandbox) => {
                // --- arrange ---
                const stubs = createTestStubs({
                    sandbox,
                    createOpenAIClientResult: openAIClient,
                    createGoogleClientResult: googleGenerativeAIClient,
                });

                // --- act ---
                const result = await ProviderFactory.createProviderMap(
                    VendorDescriptor.create(Vendors.all()),
                    new Map<Vendor, string>([
                        ["openai", "openai-api-key"],
                        ["google", "google-api-key"],
                    ]),
                );

                // --- assert ---
                expect(result).toStrictEqual(
                    new Map<string, unknown>([
                        ["openai", new OpenAIModelProvider(openAIClient)],
                        [
                            "google",
                            new GoogleModelProvider(
                                googleGenerativeAIClient,
                                "google-api-key",
                            ),
                        ],
                    ]),
                );

                expect(stubs.createOpenAIClient).toHaveBeenCalledOnceWith(
                    "openai-api-key",
                );

                expect(stubs.createGoogleClient).toHaveBeenCalledOnceWith(
                    "google-api-key",
                );
            }),
        );

        it(
            "should return undefined without ever invoking any client " +
                "factory when any API key is missing",
            withSandbox(async (sandbox) => {
                // --- arrange ---
                const stubs = createTestStubs({
                    sandbox,
                    createOpenAIClientResult: openAIClient,
                    createGoogleClientResult: googleGenerativeAIClient,
                });

                // --- act ---
                const result = await ProviderFactory.createProviderMap(
                    VendorDescriptor.create(Vendors.all()),
                    new Map<string, string>([
                        // omit the Google API key on purpose
                        ["openai", "openai-api-key"],
                    ]),
                );

                expect(result).toBeUndefined();
                expect(stubs.createOpenAIClient).not.toHaveBeenCalled();
                expect(stubs.createGoogleClient).not.toHaveBeenCalled();
            }),
        );

        it(
            "should return undefined when a client for any vendor " +
                "could not be created despite valid API keys",
            withSandbox(async (sandbox) => {
                // --- arrange ---
                const stubs = createTestStubs({
                    sandbox,
                    createOpenAIClientResult: openAIClient,
                    createGoogleClientResult: undefined,
                });

                // --- act ---
                const result = await ProviderFactory.createProviderMap(
                    VendorDescriptor.create(Vendors.all()),
                    new Map<string, string>([
                        ["openai", "openai-api-key"],
                        ["google", "google-api-key"],
                    ]),
                );

                // --- assert ---
                expect(result).toBeUndefined();
                expect(stubs.createOpenAIClient).toHaveBeenCalledOnceWith(
                    "openai-api-key",
                );

                expect(stubs.createGoogleClient).toHaveBeenCalledOnceWith(
                    "google-api-key",
                );
            }),
        );
    });
});
