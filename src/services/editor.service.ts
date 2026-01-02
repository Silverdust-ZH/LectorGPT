// -----------------------------------------------------------------------------
// Author:  Samuel Lörtscher
// Date:    25 January 2026
// Project: LectorGPT: LaTeX text refinement powered by OpenAI and Google
// -----------------------------------------------------------------------------

//

// import all required third party modules
import * as vsc from "vscode";

// import all required project modules
import { ModelDescriptor } from "@lectorgpt/descriptors";

//

// -----------------------------------------------------------------------------
// Module Scoped (Private) Types & Functions
// -----------------------------------------------------------------------------

//

/**
 * Inserts a header comment at the given position using the provided text.
 *
 * @param edit - The edit instance to insert the header with
 * @param position - The position at which to insert the header
 * @param text - The text to include into the header
 * @param maxLength - The maximum line length for the header
 *
 * @author Samuel Lörtscher
 */
const insertHeader = (
    edit: vsc.TextEditorEdit,
    position: vsc.Position,
    text: string,
    maxLength: number,
): void => {
    const prefix = "-".repeat(Math.ceil((maxLength - text.length - 8) / 2));
    const suffix = "-".repeat(maxLength - text.length - prefix.length - 8);
    edit.insert(position, `\n\n% ${prefix} % ${text} % ${suffix}\n`);
};

//

// -----------------------------------------------------------------------------
// Exported Public Interface
// -----------------------------------------------------------------------------

//

/**
 * The EditorService is responsible for interacting with the text editor,
 * such as retrieving the current selection and inserting suggestions.
 *
 * @author Samuel Lörtscher
 */
export const EditorService = {
    /**
     * Get the current text selection from the given text editor.
     * If no text is selected, a warning message is shown and undefined
     * is returned.
     *
     * @param textEditor - The text editor to get the current selection from
     *
     * @returns The current selection or undefined when no text is selected
     *
     * @author Samuel Lörtscher
     */
    getCurrentSelection: async (
        textEditor: vsc.TextEditor,
    ): Promise<vsc.Selection | undefined> => {
        // the text selection is represented as a range between a start and
        // end position, which can be retrieved from the text editor's selection
        const selection = textEditor.selection;

        // if the selection is valid, it is returned to the caller. Otherwise,
        // a warning message is shown to the user to inform them that no text
        // is selected, and undefined is returned to indicate that there is no
        // valid selection available
        if (textEditor.document.getText(selection).trim() !== "") {
            return selection;
        } else {
            vsc.window.showWarningMessage("LectorGPT: No text selected.");
            return undefined;
        }
    },

    //

    //

    /**
     * Inserts a suggestion into the given text editor, decorating it with
     * headers to distinguish the original text from the suggestion.
     *
     * @param textEditor - The text editor to insert the suggestion into
     * @param suggestion - The suggestion text to insert
     * @param model - The model descriptor for the suggestion
     *
     * @author Samuel Lörtscher
     */
    insertSuggestion: async (
        textEditor: vsc.TextEditor,
        suggestion: string,
        model: ModelDescriptor,
    ): Promise<void> => {
        // the maximum line length for the headers is determined based on the
        // editor configuration, specifically the "rulers" setting. If no ruler
        // is configured, a default value of 80 is used. This ensures that the
        // headers are formatted correctly and do not exceed the desired line
        // length, improving readability and aesthetics in the editor
        const maxLength =
            vsc.workspace
                .getConfiguration("editor", {
                    uri: textEditor.document.uri,
                    languageId: textEditor.document.languageId,
                })
                .get<number[]>("rulers")?.[0] ?? 80;

        const success = await textEditor.edit((edit: vsc.TextEditorEdit) => {
            // the original text is marked with a header to distinguish it from
            // the suggestion. The header includes the label "ORIGINAL" to
            // indicate that this is the original text selected by the user
            insertHeader(
                edit,
                textEditor.selection.start,
                "ORIGINAL",
                maxLength,
            );

            // the suggestion is also marked with a header that includes the
            // name of the model used to generate the suggestion.
            // This provides context to the user about the source of the
            // suggestion and helps him understand that the suggestion is
            // generated by a specific model, which can be useful for
            // evaluating the quality and relevance of the suggestion
            insertHeader(
                edit,
                textEditor.selection.end,
                `SUGGESTION (${ModelDescriptor.label(model)})`,
                maxLength,
            );

            // the suggestion is inserted at the end of the original selection,
            // which allows the user to easily compare the original text with
            // the suggestion. By inserting the suggestion after the original
            // text, we maintain a logical flow in the document and make it
            // clear that the suggestion is an alternative to the original
            // selection
            edit.insert(textEditor.selection.end, suggestion);
        });

        // if the insertion of the suggestion fails for any reason, such as
        // an edit conflict or an invalid selection, an error message is shown
        // to the user to inform them that the suggestion could not be inserted
        if (!success) {
            vsc.window.showErrorMessage(
                "LectorGPT: Unable to insert suggestion.",
            );
        }
    },
} as const;
