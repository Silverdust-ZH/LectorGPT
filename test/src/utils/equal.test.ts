// -----------------------------------------------------------------------------
// Author:  Samuel Lörtscher
// Date:    25 January 2026
// Project: LectorGPT: LaTeX text refinement powered by OpenAI and Google
// -----------------------------------------------------------------------------

//

// import all required third party modules
import expect from "expect";
import type { SinonSandbox } from "sinon";

// import all required project modules
import { Equal } from "@lectorgpt/utils";
import { withSandbox } from "@lectorgpt/testkit";

type Entity = { id: number };

describe("Equal", () => {
    const predicateStub = (sandbox: SinonSandbox) =>
        sandbox.stub().callsFake((a: Entity, b: Entity) => a.id === b.id);

    describe("optionals", () => {
        it(
            "should return true without ever invoking the predicate " +
                "function when both entities are undefined",
            withSandbox(async (sandbox) => {
                // --- arrange ---
                const left = undefined;
                const right = undefined;
                const predicate = predicateStub(sandbox);

                // --- act ---
                const result = Equal.optionals(left, right, predicate);

                // --- assert ---
                expect(result).toBe(true);
                expect(predicate).not.toHaveBeenCalled();
            }),
        );

        it(
            "should return false without ever invoking the predicate " +
                "function when exactly one entity is undefined",
            withSandbox(async (sandbox) => {
                // --- arrange ---
                const left = { id: 42 };
                const right = undefined;
                const predicate = predicateStub(sandbox);

                // --- act ---
                const result = Equal.optionals(left, right, predicate);

                // --- assert ---
                expect(result).toBe(false);
                expect(predicate).not.toHaveBeenCalled();
            }),
        );

        it(
            "should return true when both entities are defined and the " +
                "predicate function evaluates to true",
            withSandbox(async (sandbox) => {
                // --- arrange ---
                const left = { id: 42 };
                const right = { id: 42 };
                const predicate = predicateStub(sandbox);

                // --- act ---
                const result = Equal.optionals(left, right, predicate);

                // --- assert ---
                expect(result).toBe(true);
                expect(predicate).toHaveBeenCalledOnceWith(left, right);
            }),
        );

        it(
            "should return false when both entities are defined but the " +
                "predicate function evaluates to false",
            withSandbox(async (sandbox) => {
                // --- arrange ---
                const left = { id: 42 };
                const right = { id: 54 };
                const predicate = predicateStub(sandbox);

                // --- act ---
                const result = Equal.optionals(left, right, predicate);

                // --- assert ---
                expect(result).toBe(false);
                expect(predicate).toHaveBeenCalledOnceWith(left, right);
            }),
        );
    });

    //

    //

    describe("arrays", () => {
        it(
            "should return true without ever invoking the predicate " +
                "function when both arrays are undefined",
            withSandbox(async (sandbox) => {
                // --- arrange ---
                const left = undefined;
                const right = undefined;
                const predicate = predicateStub(sandbox);

                // --- act ---
                const result = Equal.arrays(left, right, predicate);

                // --- assert ---
                expect(result).toBe(true);
                expect(predicate).not.toHaveBeenCalled();
            }),
        );

        it(
            "should return false without ever invoking the predicate " +
                "function when exactly one array is undefined",
            withSandbox(async (sandbox) => {
                // --- arrange ---
                const left = [{ id: 42 }];
                const right = undefined;
                const predicate = predicateStub(sandbox);

                // --- act ---
                const result = Equal.arrays(left, right, predicate);

                // --- assert ---
                expect(result).toBe(false);
                expect(predicate).not.toHaveBeenCalled();
            }),
        );

        it(
            "should return false without ever invoking the predicate " +
                "function when both arrays are defined but " +
                "have different lengths",
            withSandbox(async (sandbox) => {
                // --- arrange ---
                const left = [{ id: 42 }];
                const right = [{ id: 42 }, { id: 43 }];
                const predicate = predicateStub(sandbox);

                // --- act ---
                const result = Equal.arrays(left, right, predicate);

                // --- assert ---
                expect(result).toBe(false);
                expect(predicate).not.toHaveBeenCalled();
            }),
        );

        it(
            "should return true when both arrays are defined, have the " +
                "same length, and the predicate function evaluates to true " +
                "for all elements",
            withSandbox(async (sandbox) => {
                // --- arrange ---
                const left = [{ id: 42 }, { id: 43 }];
                const right = [{ id: 42 }, { id: 43 }];
                const predicate = predicateStub(sandbox);

                // --- act ---
                const result = Equal.arrays(left, right, predicate);

                // --- assert ---
                expect(result).toBe(true);
                expect(predicate).toHaveBeenCalledTwice();
            }),
        );

        it(
            "should return false when both arrays are defined, have the " +
                "same length, but the predicate function evaluates to false " +
                "for one or more elements",
            withSandbox(async (sandbox) => {
                // --- arrange ---
                const left = [{ id: 41 }, { id: 42 }];
                const right = [{ id: 41 }, { id: 43 }];
                const predicate = predicateStub(sandbox);

                // --- act ---
                const result = Equal.arrays(left, right, predicate);

                // --- assert ---
                expect(result).toBe(false);
                expect(predicate).toHaveBeenCalledTwice();
            }),
        );
    });
});
