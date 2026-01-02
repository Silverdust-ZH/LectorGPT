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
import { AsyncChain } from "@lectorgpt/utils/chain";
import { withSandbox } from "@lectorgpt/testkit";

describe("AsyncChain", () => {
    describe("from", () => {
        it(
            "should create a new AsyncChain instance resolving to the " +
                "initial context",
            async () => {
                // --- arrange ---
                const initialValue = 42;

                // --- act ---
                const chain = AsyncChain.from("value", initialValue);
                const result = await chain.run(({ value }) => value);

                // --- assert ---
                expect(result).toBe(initialValue);
            },
        );
    });

    describe("bind", () => {
        it(
            "should invoke the bind function with the intermediate context " +
                "to bind an additional value to the context",
            withSandbox(async (sandbox: SinonSandbox) => {
                // --- arrange ---
                const initialValue = 42;
                const anotherValue = "samuel";

                const bindAnotherFn = sandbox.stub().returns(anotherValue);

                // --- act ---
                const chain = AsyncChain.from("initial", initialValue);
                const updatedChain = chain.bind("another", bindAnotherFn);
                const result = await updatedChain.run((ctx) => ctx);

                // --- assert ---
                expect(result).toStrictEqual({
                    initial: initialValue,
                    another: anotherValue,
                });

                expect(bindAnotherFn).toHaveBeenCalledOnceWith({
                    initial: initialValue,
                });
            }),
        );

        it(
            "should propagate undefined without ever invoking any bind " +
                "function when the initial value is already undefined",
            withSandbox(async (sandbox: SinonSandbox) => {
                // --- arrange ---
                const initialValue = undefined;
                const anotherValue = "samuel";
                const yetAnotherValue = undefined;
                const yetAnotherBloodyValue = "airborne";

                const bindAnotherFn = sandbox.stub().returns(anotherValue);
                const bindYetAnotherFn = sandbox
                    .stub()
                    .returns(yetAnotherValue);

                const bindYetAnotherBloodyFn = sandbox
                    .stub()
                    .returns(yetAnotherBloodyValue);

                // --- act ---
                const chain = AsyncChain.from("initial", initialValue)
                    .bind("another", bindAnotherFn)
                    .bind("yetAnother", bindYetAnotherFn)
                    .bind("yetAnotherBloody", bindYetAnotherBloodyFn);
                const result = await chain.run(() => "result");

                // --- assert ---
                expect(result).toBeUndefined();
                expect(bindAnotherFn).not.toHaveBeenCalled();
                expect(bindYetAnotherFn).not.toHaveBeenCalled();
                expect(bindYetAnotherBloodyFn).not.toHaveBeenCalled();
            }),
        );

        it(
            "should propagate undefined without ever invoking any " +
                "subsequent bind callbacks after the first bind callback " +
                "that resolved to undefined",
            withSandbox(async (sandbox: SinonSandbox) => {
                // --- arrange ---
                const initialValue = 42;
                const anotherValue = "samuel";
                const yetAnotherValue = undefined;
                const yetAnotherBloodyValue = "airborne";

                const bindAnotherFn = sandbox.stub().returns(anotherValue);
                const bindYetAnotherFn = sandbox
                    .stub()
                    .returns(yetAnotherValue);

                const bindYetAnotherBloodyFn = sandbox
                    .stub()
                    .returns(yetAnotherBloodyValue);

                // --- act ---
                const chain = AsyncChain.from("initial", initialValue);
                const updatedChain = chain
                    .bind("another", bindAnotherFn)
                    .bind("yetAnother", bindYetAnotherFn)
                    .bind("yetAnotherBloody", bindYetAnotherBloodyFn);
                const result = await updatedChain.run(() => "result");

                // --- assert ---
                expect(result).toBeUndefined();
                expect(bindAnotherFn).toHaveBeenCalledOnceWith({
                    initial: initialValue,
                });

                expect(bindYetAnotherFn).toHaveBeenCalledOnceWith({
                    initial: initialValue,
                    another: anotherValue,
                });

                expect(bindYetAnotherBloodyFn).not.toHaveBeenCalled();
            }),
        );
    });

    describe("run", () => {
        it(
            "should invoke the run function with the initial value as " +
                "context when no bind steps were added",
            withSandbox(async (sandbox: SinonSandbox) => {
                // --- arrange ---
                const initialValue = 42;

                const runFn = sandbox.stub().returns("result");

                // --- act ---
                const chain = AsyncChain.from("initial", initialValue);
                const result = await chain.run(runFn);

                // --- assert ---
                expect(result).toBe("result");
                expect(runFn).toHaveBeenCalledOnceWith({
                    initial: initialValue,
                });
            }),
        );

        it(
            "should invoke the run function with the final context " +
                "containing the initial value and all values bound via " +
                "additional bind steps",
            withSandbox(async (sandbox: SinonSandbox) => {
                // --- arrange ---
                const initialValue = 42;
                const anotherValue = "samuel";
                const yetAnotherValue = "lörtscher";
                const yetAnotherBloodyValue = "airborne";

                const runFn = sandbox.stub().returns("result");

                // --- act ---
                const chain = AsyncChain.from("initial", initialValue)
                    .bind("another", () => anotherValue)
                    .bind("yetAnother", () => yetAnotherValue)
                    .bind("yetAnotherBloody", () => yetAnotherBloodyValue);
                const result = await chain.run(runFn);

                // --- assert ---
                expect(result).toBe("result");
                expect(runFn).toHaveBeenCalledOnceWith({
                    initial: initialValue,
                    another: anotherValue,
                    yetAnother: yetAnotherValue,
                    yetAnotherBloody: yetAnotherBloodyValue,
                });
            }),
        );

        it(
            "should propagate undefined without ever invoking the run " +
                "function when the initial value is already undefined",
            withSandbox(async (sandbox: SinonSandbox) => {
                // --- arrange ---
                const initialValue = undefined;
                const anotherValue = "samuel";
                const yetAnotherValue = "lörtscher";
                const yetAnotherBloodyValue = "airborne";

                const runFn = sandbox.stub().returns("result");

                // --- act ---
                const chain = AsyncChain.from("initial", initialValue)
                    .bind("another", () => anotherValue)
                    .bind("yetAnother", () => yetAnotherValue)
                    .bind("yetAnotherBloody", () => yetAnotherBloodyValue);
                const result = await chain.run(runFn);

                // --- assert ---
                expect(result).toBeUndefined();
                expect(runFn).not.toHaveBeenCalled();
            }),
        );

        it(
            "should propagate undefined without ever invoking the run " +
                "function when any of the bind functions resolved to undefined",
            withSandbox(async (sandbox: SinonSandbox) => {
                // --- arrange ---
                const initialValue = 42;
                const anotherValue = "samuel";
                const yetAnotherValue = undefined;
                const yetAnotherBloodyValue = "airborne";

                const runFn = sandbox.stub().returns("result");

                // --- act ---
                const chain = AsyncChain.from("initial", initialValue)
                    .bind("another", () => anotherValue)
                    .bind("yetAnother", () => yetAnotherValue)
                    .bind("yetAnotherBloody", () => yetAnotherBloodyValue);
                const result = await chain.run(runFn);

                // --- assert ---
                expect(result).toBeUndefined();
                expect(runFn).not.toHaveBeenCalled();
            }),
        );
    });
});
