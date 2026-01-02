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
 * A discriminated union type representing the result of an operation that can
 * either succeed with a value of type `T` or fail with an error including
 * context information.
 *
 * @author Samuel Lörtscher
 */
export type Result<T> =
    | { kind: "success"; value: T }
    | { kind: "failure"; context: string; error: unknown };

//

//

/**
 * The Result module contains utility functions for creating and working with
 * `Result` values, such as constructors for success and failure cases, and type
 * guards for checking the kind of a result.
 *
 * @author Samuel Lörtscher
 */
export const Result = {
    /**
     * Creates a successful result containing the given value.
     *
     * @param value - The successful result value.
     *
     * @returns A result representing a successful operation.
     *
     * @author Samuel Lörtscher
     */
    success: <T>(value: T): Result<T> => {
        return { kind: "success", value };
    },

    /**
     * Creates a failed result containing the given context and error.
     *
     * @param context - The context in which the error occurred.
     * @param error - Arbitrary error information.
     *
     * @returns A result representing a failed operation.
     *
     * @author Samuel Lörtscher
     */
    failure: <T>(context: string, error: string | unknown): Result<T> => {
        return {
            kind: "failure",
            context,
            error: typeof error === "string" ? new Error(error) : error,
        };
    },

    /**
     * A type guard that checks whether a result represents a
     * successful operation.
     *
     * @param result - The result to check.
     *
     * @returns `true` if the result represents a successful operation,
     * otherwise `false`.
     *
     * @author Samuel Lörtscher
     */
    isSuccess: <T>(
        result: Result<T>,
    ): result is Extract<Result<T>, { kind: "success" }> => {
        return result.kind === "success";
    },

    /**
     * A type guard that checks whether a result represents a
     * failed operation.
     *
     * @param result - The result to check.
     *
     * @returns `true` if the result represents a failed operation,
     * otherwise `false`.
     *
     * @author Samuel Lörtscher
     */
    isFailure: <T>(
        result: Result<T>,
    ): result is Extract<Result<T>, { kind: "failure" }> => {
        return result.kind === "failure";
    },
} as const;
