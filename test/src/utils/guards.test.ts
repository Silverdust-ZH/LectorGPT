// -----------------------------------------------------------------------------
// Author:  Samuel Lörtscher
// Date:    25 January 2026
// Project: LectorGPT: LaTeX text refinement powered by OpenAI and Google
// -----------------------------------------------------------------------------

//

// import all required third party modules
import expect from "expect";

// import all required project modules
import { Guards } from "@lectorgpt/utils";
import { forEach } from "@lectorgpt/testkit";

describe("Guards", () => {
    describe("isDefined", () => {
        it("should return true for values that are not undefined", () => {
            // --- arrange ---
            const value = "hal";

            // --- act ---
            const result = Guards.isDefined(value);

            // --- assert ---
            expect(result).toBe(true);
        });

        it("should return false for values that are undefined", () => {
            // --- arrange ---
            const value = undefined;

            // --- act ---
            const result = Guards.isDefined(value);

            // --- assert ---
            expect(result).toBe(false);
        });
    });

    //

    //

    describe("isNonEmpty", () => {
        it("should return false for undefined", () => {
            // --- arrange ---
            const value = undefined;

            // --- act ---
            const result = Guards.isNonEmpty(value);

            // --- assert ---
            expect(result).toBe(false);
        });

        it("should return false for an empty string", () => {
            // --- arrange ---
            const value = "";

            // --- act ---
            const result = Guards.isNonEmpty(value);

            // --- assert ---
            expect(result).toBe(false);
        });

        it("should return true for a non-empty string", () => {
            // --- arrange ---
            const value = "hal";

            // --- act ---
            const result = Guards.isNonEmpty(value);

            // --- assert ---
            expect(result).toBe(true);
        });

        it("should return false for an empty array", () => {
            // --- arrange ---
            const value = [] as unknown[];

            // --- act ---
            const result = Guards.isNonEmpty(value);

            // --- assert ---
            expect(result).toBe(false);
        });

        it("should return true for a non-empty array", () => {
            // --- arrange ---
            const value = [42];

            // --- act ---
            const result = Guards.isNonEmpty(value);

            // --- assert ---
            expect(result).toBe(true);
        });

        it("should return false for an empty object", () => {
            // --- arrange ---
            const value = {};

            // --- act ---
            const result = Guards.isNonEmpty(value);

            // --- assert ---
            expect(result).toBe(false);
        });

        it("should return true for a non-empty object", () => {
            // --- arrange ---
            const value = { a: 42 };

            // --- act ---
            const result = Guards.isNonEmpty(value);

            // --- assert ---
            expect(result).toBe(true);
        });

        forEach([
            ["Date", new Date()],
            ["Set", new Set()],
            ["WeakSet", new WeakSet()],
            ["Map", new Map()],
            ["WeakMap", new WeakMap()],
            ["ArrayBuffer", new ArrayBuffer()],
            ["Uint8Array", new Uint8Array()],
        ]).test("should return true for any %s", (value) => () => {
            // --- act ---
            const result = Guards.isNonEmpty(value);

            // --- assert ---
            expect(result).toBe(true);
        });
    });
});
