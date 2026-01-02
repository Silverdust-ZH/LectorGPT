// -----------------------------------------------------------------------------
// Author:  Samuel Lörtscher
// Date:    25 January 2026
// Project: LectorGPT: LaTeX text refinement powered by OpenAI and Google
// -----------------------------------------------------------------------------

//

// import all required third-party modules
import expect from "expect";

// import all required project modules
import { Result } from "@lectorgpt/types";

describe("Result", () => {
    describe("success", () => {
        it("should return a success result with the given value", () => {
            // --- act ---
            const result = Result.success("any-value");

            // --- assert ---
            expect(result).toStrictEqual({
                kind: "success",
                value: "any-value",
            });
        });
    });

    //

    //

    describe("failure", () => {
        it(
            "should return a failure result with the given context " +
                "and error when the given error is an Error object",
            () => {
                // -- arrange ---
                const error = new Error("any-error");

                // --- act ---
                const result = Result.failure("any-context", error);

                // --- assert ---
                expect(result).toStrictEqual({
                    kind: "failure",
                    context: "any-context",
                    error,
                });
            },
        );

        it(
            "should return an error result with the given context " +
                "and error when the given error is of unknown type",
            () => {
                // -- arrange ---
                const error = { msg: "any-msg" };

                // --- act ---
                const result = Result.failure("any-context", error);

                // --- assert ---
                expect(result).toStrictEqual({
                    kind: "failure",
                    context: "any-context",
                    error,
                });
            },
        );

        it(
            "should return an error result with the given context and " +
                "a constructed Error object when the given error is a string",
            () => {
                // -- arrange ---
                const error = "any-error";

                // --- act ---
                const result = Result.failure("any-context", error);

                // --- assert ---
                expect(result).toStrictEqual({
                    kind: "failure",
                    context: "any-context",
                    error: new Error("any-error"),
                });
            },
        );
    });

    //

    //

    describe("isSuccess", () => {
        it("should return true when the given result is a success", () => {
            // --- arrange ---
            const value = Result.success("any-value");

            // --- act ---
            const result = Result.isSuccess(value);

            // --- assert ---
            expect(result).toBe(true);
        });

        it("should return false when the given result is a failure", () => {
            // --- arrange ---
            const value = Result.failure("any-context", "any-error");

            // --- act ---
            const result = Result.isSuccess(value);

            // --- assert ---
            expect(result).toBe(false);
        });
    });

    //

    //

    describe("isFailure", () => {
        it("should return true when the given result is a failure", () => {
            // --- arrange ---
            const value = Result.failure("any-context", "any-error");

            // --- act ---
            const result = Result.isFailure(value);

            // --- assert ---
            expect(result).toBe(true);
        });

        it("should return false when the given result is a success", () => {
            // --- arrange ---
            const value = Result.success("any-value");

            // --- act ---
            const result = Result.isFailure(value);

            // --- assert ---
            expect(result).toBe(false);
        });
    });
});
