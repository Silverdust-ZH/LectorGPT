// -----------------------------------------------------------------------------
// Author:  Samuel Lörtscher
// Date:    25 January 2026
// Project: LectorGPT: LaTeX text refinement powered by OpenAI and Google
// -----------------------------------------------------------------------------

//

// import all required third-party modules
import expect from "expect";

// import all required project modules
import { Vendor } from "@lectorgpt/types";

describe("Vendor", () => {
    describe("label", () => {
        it("should return the correct label for an openai vendor", () => {
            // --- act ---
            const result = Vendor.label("openai");

            // --- assert ---
            expect(result).toBe("OpenAI API");
        });

        it("should return the correct label for a google vendor", () => {
            // --- act ---
            const result = Vendor.label("google");

            // --- assert ---
            expect(result).toBe("Google API");
        });
    });
});
