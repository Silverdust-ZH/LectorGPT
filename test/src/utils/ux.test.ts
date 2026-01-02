// -----------------------------------------------------------------------------
// Author:  Samuel Lörtscher
// Date:    25 January 2026
// Project: LectorGPT: LaTeX text refinement powered by OpenAI and Google
// -----------------------------------------------------------------------------

//

// import all required third party modules
import expect from "expect";

// import all required project modules
import { Ux } from "@lectorgpt/utils";

describe("Ux", () => {
    describe("withActiveMark", () => {
        it("should prefix the label with a checkmark when it is active", () => {
            // --- arrange ---
            const active = true;

            // --- act ---
            const result = Ux.withActiveMark("Hal", active);

            // --- assert ---
            expect(result).toBe("✓  Hal");
        });

        it("should return the label unchanged when it is not active", () => {
            // --- arrange ---
            const active = false;

            // --- act ---
            const result = Ux.withActiveMark("Hal", active);

            // --- assert ---
            expect(result).toBe("Hal");
        });
    });

    //

    //

    describe("withConditionalWarning", () => {
        it("should append a warning when the condition is met", () => {
            // --- arrange ---
            const condition = true;

            // --- act ---
            const result = Ux.withConditionalWarning(
                "Open the hatch",
                condition,
                "Hal might refuse to open the hatch",
            );

            // --- assert ---
            expect(result).toBe(
                "Open the hatch (Hal might refuse to open the hatch)",
            );
        });

        it(
            "should return the label unchanged when the condition " +
                "is not met",
            () => {
                // --- arrange ---
                const condition = false;

                // --- act ---
                const result = Ux.withConditionalWarning(
                    "Open the hatch",
                    condition,
                    "Hal might refuse to open the hatch",
                );

                // --- assert ---
                expect(result).toBe("Open the hatch");
            },
        );
    });

    //

    //

    describe("withContext", () => {
        it("should be able to deal with an ordinary error", () => {
            // --- arrange ---
            const error = new Error("any-message");

            // --- act ---
            const msg = Ux.withContext("any-context", error);

            // --- assert ---
            expect(msg).toBe("any-context (Error: any-message)");
        });

        it("should be able to deal with a plain error message", () => {
            // --- arrange ---
            const error = "any-error";

            // --- act ---
            const msg = Ux.withContext("any-context", error);

            // --- assert ---
            expect(msg).toBe("any-context (Error: any-error)");
        });

        it("should trim a plain error message", () => {
            // --- arrange ---
            const error = ` '" any-error "' `;

            // --- act ---
            const msg = Ux.withContext("any-context", error);

            // --- assert ---
            expect(msg).toBe("any-context (Error: any-error)");
        });

        it("should be able to deal with an empty error message", () => {
            // --- arrange ---
            const error = "";

            // --- act ---
            const msg = Ux.withContext("any-context", error);

            // --- assert ---
            expect(msg).toBe("any-context");
        });

        it("should be able to deal with an arbitrary object", () => {
            // --- arrange ---
            const error = { err: "any-error" };

            // --- act ---
            const msg = Ux.withContext("any-context", error);

            // --- assert ---
            expect(msg).toBe(`any-context (Error: {"err":"any-error"})`);
        });

        it("should be able to deal with undefined", () => {
            // --- arrange ---
            const error = undefined;

            // --- act ---
            const msg = Ux.withContext("any-context", error);

            // --- assert ---
            expect(msg).toBe("any-context");
        });
    });
});
