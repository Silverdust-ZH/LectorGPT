// -----------------------------------------------------------------------------
// Author:  Samuel Lörtscher
// Date:    25 January 2026
// Project: LectorGPT: LaTeX text refinement powered by OpenAI and Google
// -----------------------------------------------------------------------------

/* v8 ignore start */

//

// import all required third party modules
import expect, { type SyncExpectationResult } from "expect";
import type { SinonStub, SinonSpy } from "sinon";

declare module "expect" {
    interface Matchers<R> {
        // custom matchers for Sinon stubs and spies
        toHaveBeenCalled(): R;
        toHaveBeenCalledOnce(): R;
        toHaveBeenCalledTwice(): R;

        // custom matchers for Sinon stubs and spies with argument matching
        toHaveBeenCalledWith(...expected: any[]): R;
        toHaveBeenCalledOnceWith(...expected: any[]): R;
        toHaveneBeenNthCalledWith(nth: number, ...expected: any[]): R;
    }
}

expect.extend({
    /**
     * This is a custom matcher that checks whether a Sinon stub or spy
     * was called at least once by the SUT. It acts as an adapter between
     * Expect and Sinon.
     *
     * @param proxy - The proxy (stub or spy) to check upon.
     *
     * @returns An expectation result indicating whether or not
     * the expectation was met.
     *
     * @author Samuel Lörtscher
     */
    toHaveBeenCalled(proxy: SinonStub | SinonSpy): SyncExpectationResult {
        if (proxy.called) {
            return {
                pass: true,
                message: () =>
                    "Expected stub or spy NOT to have been called, but it was.",
            };
        } else {
            return {
                pass: false,
                message: () =>
                    "Expected stub or spy to have been called at least once, " +
                    `but it was called ${proxy.callCount} times.\n`,
            };
        }
    },

    //

    //

    /**
     * This is a custom matcher that checks whether a Sinon stub or spy
     * was called exactly once by the SUT. It acts as an adapter between
     * Expect and Sinon.
     *
     * @param proxy - The proxy (stub or spy) to check upon.
     *
     * @returns An expectation result indicating whether or not
     * the expectation was met.
     *
     * @author Samuel Lörtscher
     */
    toHaveBeenCalledOnce(proxy: SinonStub | SinonSpy): SyncExpectationResult {
        if (proxy.calledOnce) {
            return {
                pass: true,
                message: () =>
                    "Expected stub or spy NOT to have been called exactly " +
                    "once, but it was.",
            };
        }

        return {
            pass: false,
            message: () =>
                "Expected stub or spy to have been called exactly once, " +
                `but it was called ${proxy.callCount} times.\n`,
        };
    },

    //

    //

    /**
     * This is a custom matcher that checks whether a Sinon stub or spy
     * was called exactly twice by the SUT. It acts as an adapter between
     * Expect and Sinon.
     *
     * @param proxy - The proxy (stub or spy) to check upon.
     *
     * @returns An expectation result indicating whether or not
     * the expectation was met.
     *
     * @author Samuel Lörtscher
     */
    toHaveBeenCalledTwice(proxy: SinonStub | SinonSpy): SyncExpectationResult {
        if (proxy.calledTwice) {
            return {
                pass: true,
                message: () =>
                    "Expected stub or spy NOT to have been called exactly " +
                    "twice, but it was.",
            };
        }

        return {
            pass: false,
            message: () =>
                "Expected stub or spy to have been called exactly twice, " +
                `but it was called ${proxy.callCount} times.\n`,
        };
    },

    //

    //

    /**
     * This is a custom matcher that checks whether a Sinon stub or spy
     * was called at least once with the given arguments by the SUT.
     * It acts as an adapter between Expect and Sinon.
     *
     * @param proxy - The proxy (stub or spy) to check upon.
     * @param expectedArgs - The expected arguments to match against.
     *
     * @returns An expectation result indicating whether or not
     * the expectation was met.
     *
     * @author Samuel Lörtscher
     */
    toHaveBeenCalledWith(
        proxy: SinonStub | SinonSpy,
        ...expectedArgs: any[]
    ): SyncExpectationResult {
        const actualArgs = proxy.firstCall?.args ?? [];

        for (const call of proxy.getCalls()) {
            try {
                expect(call.args).toMatchObject(expectedArgs);
                return {
                    pass: true,
                    message: () =>
                        "Expected stub or spy NOT to have been called " +
                        "with arguments, but it was.",
                };
            } catch (exp: unknown) {
                // continue checking other calls
            }
        }

        const { matcherHint, diff } = this.utils;
        return {
            pass: false,
            message: () => {
                const header = `${matcherHint(".toHaveBeenCalledWith")}\n`;

                // Wir generieren einen sauberen Diff zwischen den Arrays
                const diffString = diff(expectedArgs, actualArgs, {
                    expand: false,
                });

                return header + `\nDifference:\n${diffString}`;
            },
        };
    },

    //

    //

    /**
     * This is a custom matcher that checks whether a Sinon stub or spy
     * was called exactly once with the given arguments by the SUT.
     * It acts as an adapter between Expect and Sinon.
     *
     * @param proxy - The proxy (stub or spy) to check upon.
     * @param expectedArgs - The expected arguments to match against.
     *
     * @returns An expectation result indicating whether or not
     * the expectation was met.
     *
     * @author Samuel Lörtscher
     */
    toHaveBeenCalledOnceWith(
        proxy: SinonStub | SinonSpy,
        ...expectedArgs: any[]
    ) {
        const callCount = proxy.callCount;
        const actualArgs = proxy.firstCall?.args ?? [];

        let pass = false;
        try {
            expect(actualArgs).toMatchObject(expectedArgs);
            pass = callCount === 1;
        } catch (e) {
            pass = false;
        }

        if (pass) {
            return {
                pass: true,
                message: () =>
                    "Expected stub or spy NOT to have been called " +
                    "once with match, but it was.",
            };
        } else {
            return {
                pass: false,
                message: () => {
                    if (callCount !== 1) {
                        return (
                            "Expected stub or spy to have been called " +
                            "exactly once with arguments, but it was " +
                            `called ${callCount} times.\n`
                        );
                    }

                    const { matcherHint, diff } = this.utils;
                    const header =
                        `${matcherHint(".toHaveBeenCalledOnceWith")}\n` +
                        `Call count: ${callCount} (Expected: 1)\n`;

                    // Wir generieren einen sauberen Diff zwischen den Arrays
                    const diffString = diff(expectedArgs, actualArgs, {
                        expand: false,
                    });

                    return header + `\nDifference:\n${diffString}`;
                },
            };
        }
    },

    //

    //

    /**
     * This is a custom matcher that checks whether the nth call of a
     * Sinon stub or spy by the SUT contained the given arguments.
     * It acts as an adapter between Expect and Sinon.
     *
     * @param proxy - The proxy (stub or spy) to check upon.
     * @param expectedArgs - The expected arguments to match against.
     *
     * @returns An expectation result indicating whether or not
     * the expectation was met.
     *
     * @author Samuel Lörtscher
     */
    toHaveBeenNthCalledWith(
        proxy: SinonStub | SinonSpy,
        nth: number,
        ...expectedArgs: any[]
    ): SyncExpectationResult {
        const callCount = proxy.callCount;
        const actualArgs = proxy.getCall(nth)?.args ?? [];

        let pass = false;
        try {
            expect(actualArgs).toMatchObject(expectedArgs);
            pass = callCount >= nth - 1;
        } catch (exp: unknown) {
            pass = false;
        }

        if (pass) {
            return {
                pass: true,
                message: () =>
                    "Expected stub or spy NOT to have been called " +
                    "once with match, but it was.",
            };
        } else {
            return {
                pass: false,
                message: () => {
                    const { matcherHint, diff } = this.utils;
                    const header =
                        `${matcherHint(".toHaveBeenNthCalledWith")}\n` +
                        `Call count: ${callCount} (Expected: >=${nth})\n`;

                    return (
                        header +
                        `\nDifference:\n${diff(expectedArgs, actualArgs, {
                            expand: false,
                        })}`
                    );
                },
            };
        }
    },
});

/* v8 ignore stop */
