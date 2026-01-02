// -----------------------------------------------------------------------------
// Author:  Samuel Lörtscher
// Date:    25 January 2026
// Project: LectorGPT: LaTeX text refinement powered by OpenAI and Google
// -----------------------------------------------------------------------------

//

// import all required third party modules
import * as vsc from "vscode";
import expect from "expect";

// import all required project modules
import "@lectorgpt/extension";
import { forEach } from "@lectorgpt/testkit";

describe("Extension ", () => {
    describe("Commands", () => {
        forEach([
            ["Select Active Vendor Setup", "select-active-vendors"],
            ["Register New API Key", "register-new-api-key"],
            ["Unregister API Key", "unregister-api-key"],
            ["Select Active Model", "select-active-model"],
            [
                "Select Active System Prompt Source",
                "select-active-system-prompt-source",
            ],
            ["Refine Active Selection", "refine-active-selection"],
        ]).test(
            "should have registered command <LectorGPT: %s>",
            (cmd) => async () => {
                // -- act --
                await vsc.extensions
                    .getExtension("samuel-loertscher.lectorgpt")
                    ?.activate();

                // -- assert --
                const commands = await vsc.commands.getCommands(true);
                expect(commands).toContain(`lectorgpt.${cmd[1]}`);
            },
        );
    });

    describe("Configuration", () => {
        it("should have a dedicated configuration section", async () => {
            // -- act --
            await vsc.extensions
                .getExtension("samuel-loertscher.lectorgpt")
                ?.activate();

            // -- assert --
            expect(
                vsc.workspace.getConfiguration("lectorgpt").get("vendors"),
            ).toBeDefined();
        });
    });
});
