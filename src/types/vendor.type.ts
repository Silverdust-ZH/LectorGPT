// -----------------------------------------------------------------------------
// Author:  Samuel Lörtscher
// Date:    25 January 2026
// Project: LectorGPT: LaTeX text refinement powered by OpenAI and Google
// -----------------------------------------------------------------------------

//

// import all required third party modules
import { match } from "ts-pattern";

//

// -----------------------------------------------------------------------------
// Exported Public Interface
// -----------------------------------------------------------------------------

//

/**
 * The Vendor type represents the supported API vendors for LectorGPT. It is a
 * union of string literals, currently "openai" and "google". This type is used
 * throughout the application to refer to the specific API vendor being used for
 * text refinement tasks.
 *
 * @author Samuel Lörtscher
 */
export type Vendor = "openai" | "google";

//

//

/**
 * The Vendor module contains utility functions related to the Vendor type, such
 * as generating user-friendly labels and providing predefined setups of vendors
 * for different use cases.
 *
 * @author Samuel Lörtscher
 */
export const Vendor = {
    /**
     * Returns a human-friendly label for a given vendor.
     *
     * @param vendor - The vendor to label.
     *
     * @returns A user-friendly label.
     *
     * @author Samuel Lörtscher
     */
    label: (vendor: Vendor): string => {
        return match(vendor)
            .with("openai", () => "OpenAI API")
            .with("google", () => "Google API")
            .exhaustive();
    },
} as const;

//

//

/**
 * The Vendors module contains predefined setups of vendors for different use
 * cases, such as using all vendors, no vendors, or specific individual vendors.
 * These setups can be used to easily configure which API vendors should be
 * utilized for text refinement tasks in the application.
 *
 * @author Samuel Lörtscher
 */
export const Vendors = {
    /**
     * Returns a setup containing all vendors.
     *
     * @returns An array of all vendor values.
     *
     * @author Samuel Lörtscher
     */
    all: (): Vendor[] => ["openai", "google"],

    //

    //

    /**
     * Returns a setup containing no vendors.
     *
     * @returns An empty array.
     *
     * @author Samuel Lörtscher
     */
    none: (): Vendor[] => [],

    //

    //

    /**
     * Returns a setup containing only the OpenAI vendor.
     *
     * @returns An array containing only the OpenAI vendor.
     *
     * @author Samuel Lörtscher
     */
    openai: (): Vendor[] => ["openai"],

    //

    //

    /**
     * Returns a setup containing only the Google vendor.
     *
     * @returns An array containing only the Google vendor.
     *
     * @author Samuel Lörtscher
     */
    google: (): Vendor[] => ["google"],
} as const;
