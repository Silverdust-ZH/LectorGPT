// -----------------------------------------------------------------------------
// Author:  Samuel Lörtscher
// Date:    25 January 2026
// Project: LectorGPT: LaTeX text refinement powered by OpenAI and Google
// -----------------------------------------------------------------------------

//

// import all required third party modules
import * as vsc from "vscode";
import type { OpenAI } from "openai";
import type { GoogleGenerativeAI } from "@google/generative-ai";
import expect from "expect";

// import all required project modules
import { ClientFactory } from "@lectorgpt/factories";
import { withSandbox, stub } from "@lectorgpt/testkit";

describe("ClientFactory", () => {
    describe("createOpenAIClient", () => {
        it(
            "should instantiate and return a new OpenAI client",
            withSandbox(async (sandbox) => {
                // --- arrange ---
                const client = stub<OpenAI>({});
                const newOpenAI = sandbox
                    .stub(ClientFactory, "newOpenAI")
                    .returns(client);

                // --- act ---
                const result =
                    await ClientFactory.createOpenAIClient("given-api-key");

                // --- assert ---
                expect(result).toBe(client);
                expect(newOpenAI).toHaveBeenCalledOnceWith("given-api-key");
            }),
        );

        it(
            "should report an error and return undefined " +
                "when no OpenAI client could be created",
            withSandbox(async (sandbox) => {
                // --- arrange ---
                sandbox.stub(ClientFactory, "newOpenAI").callsFake(() => {
                    throw new Error("any-message");
                });

                const showErrorMsg = sandbox.stub(
                    vsc.window,
                    "showErrorMessage",
                );

                // --- act ---
                const result =
                    await ClientFactory.createOpenAIClient("any-api-key");

                // --- assert ---
                expect(result).toBeUndefined();
                expect(showErrorMsg).toHaveBeenCalledOnceWith(
                    "LectorGPT: failed to create the OpenAI client " +
                        "(Error: any-message)",
                );
            }),
        );
    });

    //

    //

    describe("createGoogleClient", () => {
        it(
            "should instantiate and return a new GoogleGenerativeAI client",
            withSandbox(async (sandbox) => {
                // --- arrange ---
                const client = {} as unknown as GoogleGenerativeAI;
                const newGoogle = sandbox
                    .stub(ClientFactory, "newGoogle")
                    .returns(client);

                // --- act ---
                const result =
                    await ClientFactory.createGoogleClient("given-api-key");

                // --- assert ---
                expect(result).toBe(client);
                expect(newGoogle).toHaveBeenCalledOnceWith("given-api-key");
            }),
        );

        it(
            "should report an error and return undefined " +
                "when no GoogleGenerativeAI client could be created",
            withSandbox(async (sandbox) => {
                // --- arrange ---
                sandbox.stub(ClientFactory, "newGoogle").callsFake(() => {
                    throw new Error("any-message");
                });

                const showErrorMsg = sandbox.stub(
                    vsc.window,
                    "showErrorMessage",
                );

                // --- act ---
                const result =
                    await ClientFactory.createGoogleClient("any-api-key");

                // --- assert ---
                expect(result).toBeUndefined();
                expect(showErrorMsg).toHaveBeenCalledOnceWith(
                    "LectorGPT: failed to create the Google client " +
                        "(Error: any-message)",
                );
            }),
        );
    });
});
