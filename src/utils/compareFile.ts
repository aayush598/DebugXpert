import * as vscode from 'vscode';
import { openFile } from './fileNavigation';

export function openAndCompareFile(originalText: string, fixedText: string, title: string) {
    if (originalText === fixedText) {
        vscode.window.showInformationMessage("No changes detected. The file is already up to date.");
        return;
    }

    createVirtualFile(fixedText).then(fixedUri => {
        vscode.commands.executeCommand('vscode.diff', vscode.Uri.parse('untitled:original.txt'), fixedUri, title);

        // Ask the user if they want to apply the changes
        vscode.window.showInformationMessage("Do you want to apply the suggested changes?", "Yes", "No")
            .then(selection => {
                if (selection === "Yes") {
                    applyChanges(originalText, fixedText);
                }
            });

    }).catch(err => {
        vscode.window.showErrorMessage(`Error creating virtual file: ${err}`);
    });
}

// Create a virtual document for comparison
async function createVirtualFile(content: string): Promise<vscode.Uri> {
    const doc = await vscode.workspace.openTextDocument({ content });
    return doc.uri;
}

// Apply changes to the real file
function applyChanges(documentText: string, newText: string) {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showErrorMessage("No active text editor found.");
        return;
    }

    const edit = new vscode.WorkspaceEdit();
    const fullRange = new vscode.Range(
        new vscode.Position(0, 0),
        editor.document.positionAt(documentText.length)
    );

    edit.replace(editor.document.uri, fullRange, newText);
    vscode.workspace.applyEdit(edit).then(() => {
        editor.document.save();
        vscode.window.showInformationMessage("Changes applied successfully.");
    });
}
