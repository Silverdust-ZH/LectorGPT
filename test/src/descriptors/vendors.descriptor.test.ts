// -----------------------------------------------------------------------------
// Author:  Samuel Lörtscher
// Date:    04 January 2026
// Project: LectorGPT (LaTeX inline text refinement powered by OpenAI models)
// -----------------------------------------------------------------------------

//

// import all required third party modules
import expect from "expect";

// import all required project modules
import { VendorDescriptor } from "@lectorgpt/descriptors";

describe("VendorsDescriptor ", () => {
    describe("create", () => {
        it("should return a valid vendors descriptor", () => {
            // --- act ---
            const result = VendorDescriptor.create(["openai"]);

            // --- assert ---
            expect(result).toStrictEqual({ setup: ["openai"] });
        });

        it("should sort vendors", () => {
            // --- act ---
            const result = VendorDescriptor.create(["openai", "google"]);

            // --- assert ---
            expect(result).toStrictEqual({ setup: ["google", "openai"] });
        });

        it("should remove duplicate vendors", () => {
            // --- act ---
            const result = VendorDescriptor.create([
                "openai",
                "google",
                "openai",
            ]);

            // --- assert ---
            expect(result).toStrictEqual({ setup: ["google", "openai"] });
        });
    });

    //

    //

    describe("equal", () => {
        it(
            "should return true when comparing two " +
                "vendors descriptors containing the same vendors",
            () => {
                // --- arrange ---
                const left = VendorDescriptor.create(["openai"]);
                const right = VendorDescriptor.create(["openai"]);

                // --- act ---
                const result = VendorDescriptor.equal(left, right);

                // --- assert ---
                expect(result).toBe(true);
            },
        );

        it(
            "should return false when comparing two " +
                "vendors descriptors containing different vendors",
            () => {
                // --- arrange ---
                const left = VendorDescriptor.create(["openai"]);
                const right = VendorDescriptor.create(["google"]);

                // --- act ---
                const result = VendorDescriptor.equal(left, right);

                // --- assert ---
                expect(result).toBe(false);
            },
        );

        it(
            "should return false when comparing any vendors descriptor " +
                "with an undefined vendors descriptor",
            () => {
                // --- arrange ---
                const left = VendorDescriptor.create(["openai"]);
                const right = undefined;

                // --- act ---
                const result = VendorDescriptor.equal(left, right);

                // --- assert ---
                expect(result).toBe(false);
            },
        );

        it(
            "should return true when comparing two undefined " +
                "vendors descriptors",
            () => {
                // --- arrange ---
                const left = undefined;
                const right = undefined;

                // --- act ---
                const result = VendorDescriptor.equal(left, right);

                // --- assert ---
                expect(result).toBe(true);
            },
        );
    });

    //

    //

    describe("label", () => {
        it("should return no vendor when no vendor is present", () => {
            // --- arrange ---
            const model = VendorDescriptor.create([]);

            // --- act ---
            const result = VendorDescriptor.label(model);

            // --- assert ---
            expect(result).toBe("No vendor");
        });

        it(
            "should return openai only when openai is " +
                "the only vendor present",
            () => {
                // --- arrange ---
                const model = VendorDescriptor.create(["openai"]);

                // --- act ---
                const result = VendorDescriptor.label(model);

                // --- assert ---
                expect(result).toBe("OpenAI API only");
            },
        );

        it(
            "should return google only when google is " +
                "the only vendor present",
            () => {
                // --- arrange ---
                const model = VendorDescriptor.create(["google"]);

                // --- act ---
                const result = VendorDescriptor.label(model);

                // --- assert ---
                expect(result).toBe("Google API only");
            },
        );

        it(
            "should return openai and google when both " +
                "vendors are present",
            () => {
                // --- arrange ---
                const model = VendorDescriptor.create(["openai", "google"]);

                // --- act ---
                const result = VendorDescriptor.label(model);

                // --- assert ---
                expect(result).toBe("OpenAI API & Google API");
            },
        );
    });
});
