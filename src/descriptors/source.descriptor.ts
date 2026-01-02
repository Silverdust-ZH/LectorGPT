// -----------------------------------------------------------------------------
// Author:  Samuel Lörtscher
// Date:    25 January 2026
// Project: LectorGPT: LaTeX text refinement powered by OpenAI and Google
// -----------------------------------------------------------------------------

//

// import all required project modules
import { Equal } from "@lectorgpt/utils";

//

// -----------------------------------------------------------------------------
// Exported Public Interface
// -----------------------------------------------------------------------------

//

/**
 * The SourceDescriptor type represents a specific source from which a resource
 * can be loaded. It can either be an "asset" source, indicating that the
 * resource is bundled with the extension, or a "file" source, indicating that
 * the resource should be loaded from an external local or remote file system.
 *
 * @author Samuel Lörtscher
 */
export type SourceDescriptor =
    | { type: "asset" }
    | { type: "file"; path: string };

//

//

/**
 * The SourceDescriptor module contains utility functions for creating,
 * comparing, and labeling source descriptors. It provides factory functions
 * for generating specific types of descriptors, a comparison function for
 * checking equality of descriptors, and a labeling function for generating
 * user-friendly labels based on the source configuration.
 *
 * @author Samuel Lörtscher
 */
export const SourceDescriptor = {
    /**
     * Creates a source descriptor representing an extension-bundled asset
     * source. This descriptor can be used to indicate that the referenced
     * resource should be loaded from the extension's packaged assets (as
     * opposed to the external file system).
     *
     * @returns A source descriptor with `type: "asset"`.
     *
     * @author Samuel Lörtscher
     */
    asset: (): SourceDescriptor => ({ type: "asset" }),

    //

    //

    /**
     * Creates a source descriptor representing a file-based source. This
     * descriptor can be used to indicate that the referenced resource should be
     * loaded from an external local or remote file system (as opposed to the
     * extension's packaged assets).
     *
     * @param path - The file path to load the resource from.
     *
     * @returns A source descriptor with `type: "file"` and the provided `path`.
     *
     * @author Samuel Lörtscher
     */
    file: (path: string): SourceDescriptor => ({
        type: "file",
        path,
    }),

    //

    //

    /**
     * Compares two source descriptors for equality,
     * treating `undefined` as a valid state.
     *
     * - If both `left` and `right` are `undefined`, they are considered equal.
     * - If exactly one is `undefined`, they are considered not equal.
     * - Otherwise, the descriptors are considered equal when both their
     *   `type` and `path` (in case of `file` type) match.
     *
     * @param left - The first source descriptor.
     * @param right - The second source descriptor.
     *
     * @returns `true` if both descriptors represent the same source
     * (or both are `undefined`), otherwise `false`.
     *
     * @author Samuel Lörtscher
     */
    equal: (
        left: SourceDescriptor | undefined,
        right: SourceDescriptor | undefined,
    ): boolean => {
        return Equal.optionals<SourceDescriptor>(left, right, (left, right) => {
            return (
                (left.type === "asset" && right.type === "asset") ||
                (left.type === "file" &&
                    right.type === "file" &&
                    left.path === right.path)
            );
        });
    },

    //

    //

    /**
     * Returns a human-friendly label for a given source descriptor.
     *
     * @param source - The source descriptor to label.
     *
     * @returns A user-friendly label.
     *
     * @author Samuel Lörtscher
     */
    label: (source: SourceDescriptor): string => {
        return source.type === "file" ? source.path : "<default>";
    },
} as const;
