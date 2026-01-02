// -----------------------------------------------------------------------------
// Author:  Samuel Lörtscher
// Date:    25 January 2026
// Project: LectorGPT: LaTeX text refinement powered by OpenAI and Google
// -----------------------------------------------------------------------------

//

type Maybe<T> = T | undefined;

//

// -----------------------------------------------------------------------------
// Exported Public Interface
// -----------------------------------------------------------------------------

//

/**
 * The AsyncChain class implements a monadic chaining mechanism for asynchronous
 * computations that may yield `undefined` values. It allows to sequence
 * operations that depend on the results of previous steps, while automatically
 * short-circuiting the chain if any step results in `undefined`.
 *
 * Each step in the chain can add new properties to the context object, which is
 * passed along to subsequent steps. The final result can be produced by
 * providing a function that takes the final context and returns a value.
 *
 * @author Samuel Lörtscher
 */
export class AsyncChain<T extends object> {
    /**
     * Private constructor to enforce the use of static from method.
     * @param promise - The promise that starts the maybe monad chain.
     *
     * @returns A new AsyncChain<T> instance containing the initial context.
     *
     * @author Samuel Lörtscher
     */
    private constructor(private promise: Promise<Maybe<T>>) {}

    /**
     * Starts the chain and stores the first result under the key 'name'.
     *
     * @param name - The key under which to store the result into the context.
     * @param value - The initial value or promise.
     *
     * @returns A new AsyncChain<T> instance containing the initial context.
     *
     * @author Samuel Lörtscher
     */
    static from<K extends string, V>(
        name: K,
        value: Maybe<V> | Promise<Maybe<V>>,
    ): AsyncChain<{ [P in K]: V }> {
        return new AsyncChain(
            Promise.resolve(value).then((val) =>
                val !== undefined
                    ? ({ [name]: val } as { [P in K]: V })
                    : undefined,
            ),
        );
    }

    /**
     * Binds the next step in the chain, adding its result to the context.
     *
     * @param name - The key under which to store the result into the context.
     * @param fn - The function that produces the next value or promise
     *             (fn is short-circuited and not invoked when the context
     *             is undefined).
     *
     * @returns A new AsyncChain<T> instance with the updated context.
     *
     * @author Samuel Lörtscher
     */
    bind<K extends string, V>(
        name: K,
        fn: (ctx: T) => Maybe<V> | Promise<Maybe<V>>,
    ): AsyncChain<T & { [P in K]: V }> {
        return new AsyncChain(
            this.promise.then(async (ctx) => {
                // when the current context is undefined, nothing but
                // undefined can be produced (short-circuiting)
                if (!ctx) {
                    return undefined;
                }

                // when the result of fn is undefined, nothing but
                // undefined can be produced (short-circuiting)
                const result = await fn(ctx);
                if (result === undefined) {
                    return undefined;
                }

                // in all other cases, the new result is attached to the context
                return { ...ctx, [name]: result } as T & { [P in K]: V };
            }),
        );
    }

    /**
     * Concludes the chain by running the provided function with the final
     * context. If any step in the chain resulted in undefined, the final
     * result will also be undefined.
     *
     * @param fn - The function to run with the final context.
     *             (fn is short-circuited and not invoked when
     *             the context is undefined).
     *
     * @returns A promise resolving to the final result of
     * the AsyncChain or undefined.
     *
     * @author Samuel Lörtscher
     */
    async run<R>(fn: (ctx: T) => R): Promise<R | undefined> {
        // when the final context is undefined, nothing but
        // undefined can be produced (short-circuiting)
        const finalCtx = await this.promise;
        if (!finalCtx) {
            return undefined;
        }

        // otherwise the final result is produced by invoking
        // the provided function with the final context
        return fn(finalCtx);
    }
}
