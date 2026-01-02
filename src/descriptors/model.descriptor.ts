// -----------------------------------------------------------------------------
// Author:  Samuel Lörtscher
// Date:    25 January 2026
// Project: LectorGPT: LaTeX text refinement powered by OpenAI and Google
// -----------------------------------------------------------------------------

//

// import all required project modules
import { Vendor } from "@lectorgpt/types";
import { Equal } from "@lectorgpt/utils";

//

// -----------------------------------------------------------------------------
// Exported Public Interface
// -----------------------------------------------------------------------------

//

/**
 * The ModelDescriptor type represents a specific model configuration used for
 * text refinement tasks. It includes properties such as the API vendor, model
 * ID, human-friendly name, a hint describing the model's capabilities, and an
 * order value for sorting purposes. This descriptor is used to identify and
 * work with different models provided by various vendors in a consistent way
 * throughout the application.
 *
 * @author Samuel Lörtscher
 */
export type ModelDescriptor = {
    vendor: Vendor;
    id: string;
    name: string;
    hint: string;
    order: number;
};

//

//

/**
 * The ModelDescriptorCatalog type represents a collection of model descriptors,
 * indexed by a unique string key (e.g., a combination of vendor and model ID).
 * This catalog allows for efficient lookup and management of available models
 * in the application.
 *
 * @author Samuel Lörtscher
 */
export type ModelDescriptorCatalog = Map<string, ModelDescriptor>;

//

//

/**
 * The ModelDescriptor module contains utility functions for working with model
 * descriptors, such as comparing descriptors for equality and generating user-
 * friendly labels based on the descriptor's properties.
 *
 * @author Samuel Lörtscher
 */
export const ModelDescriptor = {
    /**
     * Compares two model descriptors for equality,
     * treating `undefined` as a valid state.
     *
     * - If both `left` and `right` are `undefined`, they are considered equal.
     * - If exactly one is `undefined`, they are considered not equal.
     * - Otherwise, the descriptors are considered equal when both their
     *   `vendor` and `id` properties match.
     *
     * @param left - The first model descriptor.
     * @param right - The second model descriptor.
     *
     * @returns `true` if both descriptors represent the same model
     * (or both are `undefined`), otherwise `false`.
     *
     * @author Samuel Lörtscher
     */
    equal: (
        left: ModelDescriptor | undefined,
        right: ModelDescriptor | undefined,
    ): boolean => {
        return Equal.optionals(left, right, (left, right) => {
            return left.vendor === right.vendor && left.id === right.id;
        });
    },

    //

    //

    /**
     * Returns a human-friendly label for a given model descriptor.
     *
     * @param model - The model descriptor to label.
     *
     * @returns A user-friendly label.
     *
     * @author Samuel Lörtscher
     */
    label: (model: ModelDescriptor): string => model.name,
} as const;
