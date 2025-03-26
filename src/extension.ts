import * as vscode from "vscode";
import { errorfix } from "./utils/Errorfix";
import { evaluateCode } from "./utils/evaluateCode";
import { openFile } from "./utils/fileNavigation";
import { checkVulnerability } from "./utils/Vulnerability";
import { addDocumentation } from "./utils/addDocumentation";
import { fetchAutocompletions } from "./utils/autocomplete";

export function activate(context: vscode.ExtensionContext) {
    console.log('Congratulations, your extension "nexora" is now active!');

    let disposable = vscode.commands.registerCommand("nexora.helloWorld", async () => {
        const options = [
            { label: "Fix Errors", command: "fixErrors" },
            { label: "Evaluate Code", command: "evaluateCode" },
            { label: "Check Vulnerability", command: "checkVulnerability" },
            { label: "Add Documentation", command: "addDocumentation" } ,
            { label: "Auto Complete", command: "autoComplete" }
        ];

        const selection = await vscode.window.showQuickPick(options.map(opt => opt.label), {
            placeHolder: "Select a function to execute",
        });

        if (!selection) {return;} // If user cancels the selection

        switch (selection) {
            case "Fix Errors":
                errorfix();
                vscode.window.showInformationMessage("Fixing Errors...");
                break;
            case "Evaluate Code":
                evaluateCode();
                vscode.window.showInformationMessage("Evaluating Code...");
                break;
            case "Check Vulnerability":
                checkVulnerability();
                vscode.window.showInformationMessage("Checking Vulnerability...");
                break;
            case "Add Documentation":
                addDocumentation();
                vscode.window.showInformationMessage("Adding Documentation...");
                break;
            case "Auto Complete":
                fetchAutocompletions();
                vscode.window.showInformationMessage("Adding Documentation...");
                break;
        }
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {
    console.log("VS Code Extension Deactivated");
}