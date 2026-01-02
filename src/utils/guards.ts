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
 * The Guards module contains a collection of type guards for common patterns
 * encountered in the application. These guards help narrow types in various
 * contexts, such as configuration values, API responses, and user input,
 * ensuring that the application can safely operate on values that meet certain
 * criteria (e.g., defined, non-empty).
 *
 * @author Samuel Lörtscher
 */
export const Guards = {
    /**
     * A type guard that checks whether a value is not `undefined`.
     * This is useful for narrowing types in array operations such as
     * `filter`, allowing TypeScript to infer that `undefined` elements
     * have been removed.
     *
     * @param value - The value to test.
     * @returns `true` if `value` is not `undefined`, otherwise `false`.
     *
     * @author Samuel Lörtscher
     */
    isDefined: <T>(value: T | undefined): value is T => {
        return value !== undefined;
    },

    //

    //

    /**
     * A type guard that checks whether a value is not empty.
     * This is useful for narrowing types when APIs (e.g. VS Code configuration)
     * yield type-derived defaults such as `""`, `{}`, or `[]` instead of
     * `undefined`even though the application wants to treat such values as
     * `undefined` (not configured).
     *
     * Values considered empty are defined as:
     * - undefined (undefined)
     * - `""`      (empty string)
     * - `[]`      (empty array)
     * - `{}`      (plain empty object)
     *
     * @param value - The value to test.
     *
     * @returns `true` if `value` is not empty, otherwise `false`.
     *
     * @author Samuel Lörtscher
     */
    isNonEmpty: <T extends string | unknown[] | object>(
        value: T | undefined,
    ): value is T => {
        // undefined values are considered empty
        if (value === undefined) {
            return false;
        }

        // empty strings are considered empty
        if (value === "") {
            return false;
        }

        // empty arrays are considered empty
        if (Array.isArray(value) && value.length === 0) {
            return false;
        }

        // plain empty objects are considered empty
        if (value !== null && typeof value === "object") {
            // an object with any prototype other than Object.prototype
            // or null is not a plain object by definition
            // (e.g., Date, Map, custom class instances, etc.)
            const proto = Object.getPrototypeOf(value);
            const isPlain = proto === Object.prototype || proto === null;
            const isEmpty = Object.keys(value as object).length === 0;

            if (isPlain && isEmpty) {
                return false;
            }
        }

        // all other values are considered non-empty
        return true;
    },
} as const;
