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

    // Register Sidebar Commands
    context.subscriptions.push(
        vscode.commands.registerCommand("nexora.fixErrors", () => {
            errorfix();
            vscode.window.showInformationMessage("Fixing Errors...");
        }),
        vscode.commands.registerCommand("nexora.evaluateCode", () => {
            evaluateCode();
            vscode.window.showInformationMessage("Evaluating Code...");
        }),
        vscode.commands.registerCommand("nexora.checkVulnerability", () => {
            checkVulnerability();
            vscode.window.showInformationMessage("Checking Vulnerability...");
        }),
        vscode.commands.registerCommand("nexora.addDocumentation", () => {
            addDocumentation();
            vscode.window.showInformationMessage("Adding Documentation...");
        }),
        vscode.commands.registerCommand("nexora.autoComplete", () => {
            fetchAutocompletions();
            vscode.window.showInformationMessage("Fetching Auto-Completion...");
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
        return [
            this.createCommandItem("Fix Errors", "nexora.fixErrors"),
            this.createCommandItem("Evaluate Code", "nexora.evaluateCode"),
            this.createCommandItem("Check Vulnerability", "nexora.checkVulnerability"),
            this.createCommandItem("Add Documentation", "nexora.addDocumentation"),
            this.createCommandItem("Auto Complete", "nexora.autoComplete"),
        ];
    }

    private createCommandItem(label: string, command: string): vscode.TreeItem {
        const item = new vscode.TreeItem(label);
        item.command = { command, title: label };
        return item;
    }
}
