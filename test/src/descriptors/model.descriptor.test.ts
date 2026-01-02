// -----------------------------------------------------------------------------
// Author:  Samuel Lörtscher
// Date:    25 January 2026
// Project: LectorGPT: LaTeX text refinement powered by OpenAI and Google
// -----------------------------------------------------------------------------

//

// import all required third party modules
import expect from "expect";

// import all required project modules
import { ModelDescriptor } from "@lectorgpt/descriptors";
import { stub } from "@lectorgpt/testkit";

describe("ModelDescriptor", () => {
    describe("equal", () => {
        it(
            "should return true when comparing two " +
                "model descriptors having the same vendor and id",
            () => {
                // --- arrange ---
                const left = stub<ModelDescriptor>({
                    vendor: "openai",
                    id: "gpt-4",
                });

                const right = stub<ModelDescriptor>({
                    vendor: "openai",
                    id: "gpt-4",
                });

                // --- act ---
                const result = ModelDescriptor.equal(left, right);

                // --- assert ---
                expect(result).toBe(true);
            },
        );

        it(
            "should return false when comparing two " +
                "model descriptors having the same vendor but different ids",
            () => {
                // --- arrange ---
                const left = stub<ModelDescriptor>({
                    vendor: "openai",
                    id: "gpt-4",
                });

                const right = stub<ModelDescriptor>({
                    vendor: "openai",
                    id: "gpt-3.5-turbo",
                });

                // --- act ---
                const result = ModelDescriptor.equal(left, right);

                // --- assert ---
                expect(result).toBe(false);
            },
        );

        it(
            "should return false when comparing two " +
                "model descriptors having the same ids but different vendors",
            () => {
                // --- arrange ---
                const left = stub<ModelDescriptor>({
                    vendor: "openai",
                    id: "gpt-4",
                });

                const right = stub<ModelDescriptor>({
                    vendor: "google",
                    id: "gpt-4",
                });

                // --- act ---
                const result = ModelDescriptor.equal(left, right);

                // --- assert ---
                expect(result).toBe(false);
            },
        );

        it(
            "should return false when comparing any model descriptor " +
                "with an undefined model descriptor",
            () => {
                // --- arrange ---
                const left = stub<ModelDescriptor>({
                    vendor: "openai",
                    id: "gpt-4",
                });

                const right = undefined;

                // --- act ---
                const result = ModelDescriptor.equal(left, right);

                // --- assert ---
                expect(result).toBe(false);
            },
        );

        it(
            "should return true when comparing two undefined " +
                "model descriptors",
            () => {
                // --- arrange ---
                const left = undefined;
                const right = undefined;

                // --- act ---
                const result = ModelDescriptor.equal(left, right);

                // --- assert ---
                expect(result).toBe(true);
            },
        );
    });

    //

    //

    describe("label", () => {
        it("should only return the name without further details", () => {
            // --- arrange ---
            const model = stub<ModelDescriptor>({
                vendor: "openai",
                id: "gpt-4",
                name: "GPT-4",
                hint: "Some hint",
                order: 1,
            });

            // --- act ---
            const result = ModelDescriptor.label(model);

            // --- assert ---
            expect(result).toBe("GPT-4");
        });
    });
});
