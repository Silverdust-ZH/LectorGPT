// -----------------------------------------------------------------------------
// Author:  Samuel Lörtscher
// Date:    25 January 2026
// Project: LectorGPT: LaTeX text refinement powered by OpenAI and Google
// -----------------------------------------------------------------------------

//

// import all required third party modules
import { match, P } from "ts-pattern";

// import all required project modules
import { Vendor } from "@lectorgpt/types";
import { Equal } from "@lectorgpt/utils";

//

// -----------------------------------------------------------------------------
// Exported Public Interface
// -----------------------------------------------------------------------------

//

/**
 * The VendorDescriptor type represents a specific configuration of API vendors
 * used in the application. It contains a `setup` property, which is an array of
 * `Vendor` values. This descriptor is used to specify which API vendors (e.g.,
 * OpenAI, Google) are being utilized for text refinement tasks.
 *
 * @author Samuel Lörtscher
 */
export type VendorDescriptor = {
    setup: Vendor[];
};

//

//

/**
 * The VendorDescriptor module contains utility functions for creating,
 * comparing, and labeling vendor descriptors. It provides a factory function
 * for generating normalized descriptors from a list of vendors, a comparison
 * function for checking equality of descriptors, and a labeling function for
 * generating user-friendly labels based on the vendor configuration.
 *
 * @author Samuel Lörtscher
 */
export const VendorDescriptor = {
    /**
     * Creates a normalized vendor descriptor from a list of vendors.
     * The returned descriptor is canonicalized by removing duplicates (set
     * semantics), and sorting the vendors to ensure a stable order. This makes
     * equality checks, caching, and serialization more predictable.
     *
     * @param vendors - The vendors to include in the descriptor.
     *
     * @returns A normalized vendor descriptor containing a unique, and sorted
     * list of vendors.
     *
     * @author Samuel Lörtscher
     */
    create: (vendors: Vendor[]): VendorDescriptor => ({
        setup: [...new Set(vendors)].sort(),
    }),

    //

    //

    /**
     * Compares two vendor descriptors for equality, treating `undefined`
     * as a valid state.
     *
     * - If both `left` and `right` are `undefined`, they are considered equal.
     * - If exactly one is `undefined`, they are considered not equal.
     * - Otherwise, the descriptors are considered equal when their `vendors`
     *   arrays are equal (same length and same elements in the same order).
     *
     * @param left - The first vendor descriptor.
     * @param right - The second vendor descriptor.
     *
     * @returns `true` if both descriptors represent the same vendors
     * (or both are `undefined`), otherwise `false`.
     *
     * @author Samuel Lörtscher
     */
    equal: (
        left: VendorDescriptor | undefined,
        right: VendorDescriptor | undefined,
    ): boolean => {
        return Equal.optionals<VendorDescriptor>(left, right, (left, right) => {
            return Equal.arrays<Vendor>(
                left.setup,
                right.setup,
                (left, right) => left === right,
            );
        });
    },

    //

    //

    /**
     * Returns a human-friendly label for a given vendor descriptor.
     *
     * @param setup - The vendor descriptor to label.
     *
     * @returns A user-friendly label.
     *
     * @author Samuel Lörtscher
     */
    label: (setup: VendorDescriptor): string => {
        return match(setup.setup)
            .with([], () => "No vendor")
            .with([P._], ([v]) => `${Vendor.label(v)} only`)
            .otherwise(
                () => `${Vendor.label("openai")} & ${Vendor.label("google")}`,
            );
    },
} as const;
