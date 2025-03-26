import * as vscode from 'vscode';
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: "AIzaSyBNP8L1vFKs_zrWQLRL32aoM9TO7GcInlM" });

export async function errorfix(): Promise<string> {  
    // Get the currently active text editor
    const editor = vscode.window.activeTextEditor;

    if (!editor) {
        vscode.window.showErrorMessage("❌ No active text editor found.");
        return ""; // Exit early if no editor is open
    }

    const document = editor.document;

    // Ensure the file is not the webview's UI HTML but an actual code file
    if (document.languageId === 'plaintext' || document.uri.scheme !== 'file') {
        vscode.window.showErrorMessage("❌ Please open a valid code file.");
        return "";
    }

    const code = document.getText(); // Get the content of the active file

    if (!code.trim()) {
        vscode.window.showErrorMessage("❌ The file is empty.");
        return ""; // Return empty string if file is empty
    }

    try {
        vscode.window.showInformationMessage("🔍 Analyzing code...");

        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: `Fix the following ${document.languageId} code:\n\n${code}\n\nProvide only the corrected code without any explanation. Dp not use special characters which is not a part of code.`
        });

        const fixedCode = response?.text?.trim();
        if (!fixedCode) {
            vscode.window.showErrorMessage("❌ No fixed code received from AI.");
            return code; // Return original code as a fallback
        }

        vscode.window.showInformationMessage("✅ Code Fix Complete.");

        // Replace the content of the currently active file with fixed code
        await editor.edit(editBuilder => {
            const fullRange = new vscode.Range(
                document.positionAt(0),
                document.positionAt(code.length)
            );
            editBuilder.replace(fullRange, fixedCode);
        });

        return fixedCode; // Return the corrected code
    } catch (error) {
        vscode.window.showErrorMessage("❌ Error fixing code: " + (error instanceof Error ? error.message : "Unknown error"));
        return code; // Return the original code as a fallback
    }
}
