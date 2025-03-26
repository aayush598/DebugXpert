import * as vscode from 'vscode';
import { openFile } from './fileNavigation';

export function openAndCompareFile() {
    const fixedText = `print("Hello")\n abc \n print("Python")`;

    openFile().then(document => {
        const originalText = document.getText();

        // Create a new virtual document for comparison
        const fixedUri = vscode.Uri.parse('untitled:FixedVersion.txt');
        vscode.workspace.openTextDocument(fixedUri).then(fixedDoc => {
            const edit = new vscode.WorkspaceEdit();
            edit.insert(fixedUri, new vscode.Position(0, 0), fixedText);
            vscode.workspace.applyEdit(edit).then(() => {
                // Open the diff view in VS Code
                vscode.commands.executeCommand('vscode.diff', document.uri, fixedUri, "File Comparison");
            });
        });

    }).catch(err => {
        vscode.window.showErrorMessage(`Error opening file: ${err}`);
    });
}
