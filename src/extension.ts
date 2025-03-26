import * as vscode from "vscode";
import { errorfix } from "./utils/Errorfix";
import { evaluateCode } from "./utils/evaluateCode";
import { checkVulnerability } from "./utils/Vulnerability";
import { addDocumentation } from "./utils/addDocumentation";
import { fetchAutocompletions } from "./utils/autocomplete";

export function activate(context: vscode.ExtensionContext) {
    console.log('Congratulations, your extension "nexora" is now active!');

    // Register Sidebar View
    const treeDataProvider = new NexoraTreeDataProvider();
    vscode.window.createTreeView("nexoraView", { treeDataProvider });
    // Register Command for Sidebar Click
    context.subscriptions.push(
        vscode.commands.registerCommand("nexora.openQuickPick", async () => {
            const options = [
                { label: "Fix Errors", command: "fixErrors" },
                { label: "Evaluate Code", command: "evaluateCode" },
                { label: "Check Vulnerability", command: "checkVulnerability" },
                { label: "Add Documentation", command: "addDocumentation" },
                { label: "Auto Complete", command: "autoComplete" },
            ];

            const selection = await vscode.window.showQuickPick(options.map(opt => opt.label), {
                placeHolder: "Select a function to execute",
            });

            if (!selection) return; // If user cancels

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
                    vscode.window.showInformationMessage("Fetching Auto-Completion...");
                    break;
            }
        })
    );
}

export function deactivate() {
    console.log("VS Code Extension Deactivated");
}

// Sidebar TreeDataProvider
class NexoraTreeDataProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
    getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
        return element;
    }

    getChildren(): vscode.TreeItem[] {
        const quickPickItem = new vscode.TreeItem("Open Nexora Actions");
        quickPickItem.command = { command: "nexora.openQuickPick", title: "Open QuickPick" };
        return [quickPickItem];
    }
}
