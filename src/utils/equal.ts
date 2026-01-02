// -----------------------------------------------------------------------------
// Author:  Samuel Lörtscher
// Date:    25 January 2026
// Project: LectorGPT: LaTeX text refinement powered by OpenAI and Google
// -----------------------------------------------------------------------------

//

// -----------------------------------------------------------------------------
// Exported Public Interface
// -----------------------------------------------------------------------------

//

/**
 * The Equal module contains a collection of utility functions for comparing
 * optional values and arrays for equality. Each function in this module follows
 * a consistent pattern for handling `undefined` values and uses a provided
 * equality predicate to compare defined values.
 *
 * @author Samuel Lörtscher
 */
export const Equal = {
    /**
     * Compares two optional values for equality.
     *
     * Returns `true` if either both values are `undefined`, or if both
     * values are defined and `eq(left, right)` evaluates to `true`.
     *
     * Returns `false` if either exactly one value is `undefined` or
     * if `eq(left, right)` evaluates to `false`.
     *
     * @param left - The first optional value.
     * @param right - The second optional value.
     * @param eq - Equality predicate used when both values are defined.
     *
     * @author Samuel Lörtscher
     */
    optionals: <T>(
        left: T | undefined,
        right: T | undefined,
        eq: (left: T, right: T) => boolean,
    ): boolean => {
        return left === right || (!!left && !!right && eq(left, right));
    },

    //

    //

    /**
     * Compares two optional arrays for element-wise equality (order-sensitive).
     *
     * Returns `true` if either both arrays are `undefined`, or if both
     * arrays are defined and have the same length and each element at index
     * `i` satisfies `eq(a[i], b[i])`.
     *
     * Returns `false` if either exactly one array is `undefined`, or if both
     * arrays are defined but have different lengths, or if both arrays are
     * defined and have the same length but at least one element pair at index
     * `i` does not satisfy `eq(a[i], b[i])`.
     *
     * @param left - The first optional array.
     * @param right - The second optional array.
     * @param eq - Equality predicate used to compare elements at the same
     *             index.
     *
     * @author Samuel Lörtscher
     */
    arrays: <T>(
        left: T[] | undefined,
        right: T[] | undefined,
        eq: (left: T, right: T) => boolean,
    ): boolean => {
        return Equal.optionals<T[]>(left, right, (left, right) => {
            return (
                left.length === right.length &&
                left.every((item, idx) => eq(item, right[idx]))
            );
        });
    },
} as const;
