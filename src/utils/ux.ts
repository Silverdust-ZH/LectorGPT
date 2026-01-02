// -----------------------------------------------------------------------------
// Author:  Samuel Lörtscher
// Date:    25 January 2026
// Project: LectorGPT: LaTeX text refinement powered by OpenAI and Google
// -----------------------------------------------------------------------------

//

// -----------------------------------------------------------------------------
// Exported Public Interface
// -----------------------------------------------------------------------------

//

/**
 * The Ux module contains a collection of utility functions for enhancing user
 * experience in the UI. These functions provide common patterns for formatting
 * labels, displaying warnings, and contextualizing error messages.
 *
 * @author Samuel Lörtscher
 */
export const Ux = {
    /**
     * Prefixes a label with an “active” checkmark indicator.
     * This is useful for visually marking the active item in UI lists.
     *
     * @param label - The base label to display.
     * @param active - Whether or not the label should be marked as active.
     *
     * @returns The label, optionally prefixed with an active checkmark marker.
     *
     * @author Samuel Lörtscher
     */
    withActiveMark: (label: string, active: boolean): string => {
        return `${active ? "✓  " : ""}${label}`;
    },

    //

    //

    /**
     * Appends a warning hint to a label when a condition is met.
     * This is useful for adding contextual warnings to UI labels.
     *
     * @param label - The base label to display.
     * @param condition - Whether or not the warning should be appended.
     * @param warning - The warning text to be appended when the
     *                  condition is met.
     *
     * @returns The base label, optionally suffixed with a warning hint.
     *
     * @author Samuel Lörtscher
     */
    withConditionalWarning: (
        label: string,
        condition: boolean,
        warning: string,
    ): string => {
        return condition ? `${label} (${warning})` : label;
    },

    //

    //

    /**
     * Prefixes an error message with contextual information.
     * This is useful for providing additional context when displaying
     * error messages in the UI.
     *
     * @param context - A short description of where / why the error occurred.
     * @param error - The caught error value (may be of any type).
     *
     * @returns A human-readable string containing the context and,
     * if present, the error text.
     *
     * @author Samuel Lörtscher
     */
    withContext: (context: string, error: any): string => {
        // try to extract a human-readable message from the parametric error
        const raw = error?.message ?? JSON.stringify(error) ?? "";

        // trim whitespace and quotes from the extracted message
        // and append it to the context if it’s not empty
        const trimmed = raw.replaceAll(/^[\s\\"']+|[\s\\"']+$/g, "");
        return context + (trimmed !== "" ? ` (Error: ${trimmed})` : "");
    },
} as const;
