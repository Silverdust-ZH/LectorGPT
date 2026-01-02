// -----------------------------------------------------------------------------
// Author:  Samuel Lörtscher
// Date:    25 January 2026
// Project: LectorGPT: LaTeX text refinement powered by OpenAI and Google
// -----------------------------------------------------------------------------

//

// import all required third party modules
import * as vsc from "vscode";
import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";

// import all required project modules
import { Ux } from "@lectorgpt/utils";

//

// -----------------------------------------------------------------------------
// Exported Public Interface
// -----------------------------------------------------------------------------

//

/**
 * The ClientFactory module contains factory functions for creating API client
 * instances for the supported vendors (OpenAI and Google). It provides a
 * centralized place for client creation logic, including error handling, and
 * abstracts away the specifics of constructing clients for different APIs.
 *
 * @author Samuel Lörtscher
 */
export const ClientFactory = {
    /**
     * OpenAI client constructor seam.
     *
     * This function exists primarily as a **test seam**: it isolates the `new
     * OpenAI(...)` constructor call behind a stable, mockable boundary so unit
     * tests can simulate constructor failures (e.g. by throwing) without the
     * necessity of module-level mocking of `openai`.
     *
     * @param apiKey - The OpenAI API key.
     *
     * @returns An OpenAI client instance.
     *
     * @author Samuel Lörtscher
     */
    /* v8 ignore next */
    newOpenAI: (apiKey: string) => new OpenAI({ apiKey }),

    /**
     * Google client constructor seam.
     *
     * This function exists primarily as a **test seam**: it isolates the `new
     * GoogleGenerativeAI(...)` constructor call behind a stable, mockable
     * boundary so unit tests can simulate constructor failures without the
     * necessity of module-level mocking of `@google/generative-ai`.
     *
     * @param apiKey - The Google API key.
     *
     * @returns A GoogleGenerativeAI client instance.
     *
     * @author Samuel Lörtscher
     */
    /* v8 ignore next */
    newGoogle: (apiKey: string) => new GoogleGenerativeAI(apiKey),

    /**
     * Generic client creation helper with centralized error handling.
     *
     * Invokes the provided factory function and returns its result. If the
     * factory throws, the exception is caught, an error is reported and
     * `undefined` is returned.
     *
     * @param apiKey - The API key passed to the factory.
     * @param fn - The factory function that creates a client
     *             with the given API key.
     *
     * @returns The created client, or `undefined` if creation fails.
     *
     * @author Samuel Lörtscher
     */
    createClient: async <T extends OpenAI | GoogleGenerativeAI>(
        name: string,
        apiKey: string,
        fn: (apiKey: string) => T | undefined,
    ): Promise<T | undefined> => {
        try {
            return fn(apiKey);
        } catch (exp: unknown) {
            // show an error message to the user
            vsc.window.showErrorMessage(
                Ux.withContext(
                    `LectorGPT: failed to create the ${name} client`,
                    exp,
                ),
            );

            return undefined;
        }
    },

    /**
     * Creates a new OpenAI client using the given API key.
     *
     * This is a specialized convenience wrapper around {@link createClient}
     * that binds the generic factory to the OpenAI implementation.
     *
     * @param apiKey - The OpenAI API key.
     *
     * @returns An OpenAI client, or `undefined` if creation fails.
     *
     * @author Samuel Lörtscher
     */
    createOpenAIClient: async (apiKey: string): Promise<OpenAI | undefined> => {
        return ClientFactory.createClient(
            "OpenAI",
            apiKey,
            ClientFactory.newOpenAI,
        );
    },

    /**
     * Creates a new Google client using the given API key.
     *
     * This is a specialized convenience wrapper around {@link createClient}
     * that binds the generic factory to the Google implementation.
     *
     * @param apiKey - The Google API key.
     *
     * @returns A Google client, or `undefined` if creation fails.
     *
     * @author Samuel Lörtscher
     */
    createGoogleClient: async (
        apiKey: string,
    ): Promise<GoogleGenerativeAI | undefined> => {
        return ClientFactory.createClient(
            "Google",
            apiKey,
            ClientFactory.newGoogle,
        );
    },
} as const;
