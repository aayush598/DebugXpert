import * as vscode from 'vscode';

export function openFile() {
    const filePath = vscode.Uri.file('/home/ayush/Aayush/Projects/BugDetectionInCode/nexora/README.md'); // Change this to the actual file path

    vscode.workspace.openTextDocument(filePath).then(document => {
        vscode.window.showTextDocument(document);
    }, err => {
        vscode.window.showErrorMessage(`Failed to open file: ${err}`);
    });
}
