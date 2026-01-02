// -----------------------------------------------------------------------------
// Author:  Samuel Lörtscher
// Date:    04 January 2026
// Project: LectorGPT (LaTeX inline text refinement powered by OpenAI models)
// -----------------------------------------------------------------------------

//

// import all required third party modules
import expect from "expect";

// import all required project modules
import { SourceDescriptor } from "@lectorgpt/descriptors";

describe("SourceDescriptor", () => {
    describe("asset", () => {
        it("should return a valid asset source descriptor", () => {
            // --- act ---
            const result = SourceDescriptor.asset();

            // --- arrange ---
            expect(result).toStrictEqual({ type: "asset" });
        });
    });

    //

    //

    describe("file", () => {
        it("should return a valid file source descriptor", () => {
            // --- act ---
            const result = SourceDescriptor.file("any-path");

            // --- arrange ---
            expect(result).toStrictEqual({
                type: "file",
                path: "any-path",
            });
        });
    });

    //

    //

    describe("equal", () => {
        it(
            "should return true when comparing two " +
                "asset source descriptors",
            () => {
                // --- arrange ---
                const left = SourceDescriptor.asset();
                const right = SourceDescriptor.asset();

                // --- act ---
                const result = SourceDescriptor.equal(left, right);

                // --- assert ---
                expect(result).toBe(true);
            },
        );

        it(
            "should return false when comparing an asset " +
                "and a file source descriptor",
            () => {
                // --- arrange ---
                const left = SourceDescriptor.asset();
                const right = SourceDescriptor.file("any-path");

                // --- act ---
                const result = SourceDescriptor.equal(left, right);

                // --- assert ---
                expect(result).toBe(false);
            },
        );

        it(
            "should return true when comparing two file source " +
                "descriptors with equal paths",
            () => {
                // --- arrange ---
                const left = SourceDescriptor.file("any-path");
                const right = SourceDescriptor.file("any-path");

                // --- act ---
                const result = SourceDescriptor.equal(left, right);

                // --- assert ---
                expect(result).toBe(true);
            },
        );

        it(
            "should return false when comparing two file source " +
                "descriptors with different paths",
            () => {
                // --- arrange ---
                const left = SourceDescriptor.file("any-path");
                const right = SourceDescriptor.file("another-path");

                // --- act ---
                const result = SourceDescriptor.equal(left, right);

                // --- assert ---
                expect(result).toBe(false);
            },
        );

        it(
            "should return false when comparing any source descriptor " +
                "with an undefined source descriptor",
            () => {
                // --- arrange ---
                const left = SourceDescriptor.file("any-path");
                const right = undefined;

                // --- act ---
                const result = SourceDescriptor.equal(left, right);

                // --- assert ---
                expect(result).toBe(false);
            },
        );

        it(
            "should return true when comparing two undefined " +
                "source descriptors",
            () => {
                // --- arrange ---
                const left = undefined;
                const right = undefined;

                // --- act ---
                const result = SourceDescriptor.equal(left, right);

                // --- assert ---
                expect(result).toBe(true);
            },
        );
    });

    //

    //

    describe("label", () => {
        it("should return default on an asset source descriptor", () => {
            // --- arrange ---
            const source = SourceDescriptor.asset();

            // --- act ---
            const result = SourceDescriptor.label(source);

            // --- assert ---
            expect(result).toBe("<default>");
        });

        it("should return the path on a file source descriptor", () => {
            // --- arrange ---
            const source = SourceDescriptor.file("any-path");

            // --- act ---
            const result = SourceDescriptor.label(source);

            // --- assert ---
            expect(result).toBe("any-path");
        });
    });
});
