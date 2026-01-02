// -----------------------------------------------------------------------------
// Author:  Samuel Lörtscher
// Date:    25 January 2026
// Project: LectorGPT: LaTeX text refinement powered by OpenAI and Google
// -----------------------------------------------------------------------------

//

// import all required third party modules
import { match } from "ts-pattern";

// import all required project modules
import { VendorDescriptor } from "@lectorgpt/descriptors";
import { Guards } from "@lectorgpt/utils";
import { ClientFactory } from "@lectorgpt/factories";
import {
    type ModelProvider,
    OpenAIModelProvider,
    GoogleModelProvider,
} from "@lectorgpt/providers";

//

// -----------------------------------------------------------------------------
// Exported Public Interface
// -----------------------------------------------------------------------------

//

/**
 * The ProviderFactory module contains a function for creating a map of
 * {@link ModelProvider} instances based on a given vendor setup and
 * corresponding API keys. It attempts to create a {@link ModelProvider} for
 * each vendor specified in the setup, and only returns either a complete map
 * (where all providers were successfully created) or `undefined`.
 *
 * @author Samuel Lörtscher
 */
export const ProviderFactory = {
    /**
     * Creates a map of {@link ModelProvider} instances for the given vendor
     * setup and API keys.
     *
     * @param vendors - The vendor setup for which {@link ModelProvider}'s
     *                  must be created.
     *
     * @param apiKeys - A map containing all known API keys, which the factory
     *                  functions will use to attempt creating clients for the
     *                  required vendors.
     *
     * @returns A map of {@link ModelProvider} keyed by vendor instances when
     * providers could be created for all vendors; otherwise `undefined`.
     *
     * @author Samuel Lörtscher
     */
    createProviderMap: async (
        vendors: VendorDescriptor,
        apiKeys: Map<string, string>,
    ): Promise<Map<string, ModelProvider> | undefined> => {
        // if any vendor is missing an API key, it is pointless to attempt
        // creating any provider, since only complete results are acceptable
        if (vendors.setup.some((vendor) => !apiKeys.has(vendor))) {
            return undefined;
        }

        const providers = await Promise.all(
            vendors.setup.map(async (vendor) => {
                // create an appropriate provider for the current vendor
                const apiKey = apiKeys.get(vendor)!;
                const provider = await match(vendor)
                    .with("openai", async () => {
                        const client =
                            await ClientFactory.createOpenAIClient(apiKey);
                        return client && new OpenAIModelProvider(client);
                    })
                    .with("google", async () => {
                        const client =
                            await ClientFactory.createGoogleClient(apiKey);
                        return (
                            client && new GoogleModelProvider(client, apiKey)
                        );
                    })
                    .exhaustive();

                // return a (vendor, provider) tuple if a provider for
                // the current vendor was indeed successfully created
                return provider && ([vendor, provider] as const);
            }),
        );

        // only return a complete map that contains a provider
        // for each vendor, otherwise return undefined
        const validProviders = providers.filter(Guards.isDefined);
        return validProviders.length === vendors.setup.length
            ? new Map(validProviders)
            : undefined;
    },
} as const;
