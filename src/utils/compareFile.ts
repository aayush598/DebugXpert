import * as vscode from 'vscode';
import { openFile } from './fileNavigation';

export function openAndCompareFile() {
    const fixedText = `print("Hello")\n abc \n print("Python")`;

    openFile().then(document => {
        const originalText = document.getText();

        if (originalText === fixedText) {
            vscode.window.showInformationMessage("No changes detected. The file is already up to date.");
            return;
        }

        vscode.commands.executeCommand('vscode.diff', document.uri, createVirtualFile(fixedText), "File Comparison");

        // Ask the user if they want to apply the changes
        vscode.window.showInformationMessage("Do you want to apply the suggested changes?", "Yes", "No")
            .then(selection => {
                if (selection === "Yes") {
                    applyChanges(document, fixedText);
                }
            });

    }).catch(err => {
        vscode.window.showErrorMessage(`Error opening file: ${err}`);
    });
}

// Create a virtual document for comparison
function createVirtualFile(content: string): vscode.Uri {
    const fixedUri = vscode.Uri.parse('untitled:FixedVersion.txt');
    vscode.workspace.openTextDocument(fixedUri).then(fixedDoc => {
        const edit = new vscode.WorkspaceEdit();
        edit.insert(fixedUri, new vscode.Position(0, 0), content);
        vscode.workspace.applyEdit(edit);
    });
    return fixedUri;
}

// Apply changes to the real file
function applyChanges(document: vscode.TextDocument, newText: string) {
    const edit = new vscode.WorkspaceEdit();
    const fullRange = new vscode.Range(
        document.positionAt(0),
        document.positionAt(document.getText().length)
    );

    edit.replace(document.uri, fullRange, newText);
    vscode.workspace.applyEdit(edit).then(() => {
        document.save();
        vscode.window.showInformationMessage("Changes applied successfully.");
    });
}
