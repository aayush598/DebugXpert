import * as vscode from 'vscode';
import { GoogleGenAI } from "@google/genai";
import * as dotenv from 'dotenv';

dotenv.config();

const ai = new GoogleGenAI({ apiKey: "AIzaSyBNP8L1vFKs_zrWQLRL32aoM9TO7GcInl" });

/**
 * Fetches the current open file's code as context.
 * @returns The full text of the open document.
 */
function getCodeContext(): string {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showErrorMessage("No active editor found.");
        return "";
    }
    return editor.document.getText();
}

/**
 * Calls Gemini AI to generate documentation for the code.
 * @returns A promise that resolves to the updated code with documentation.
 */
export async function addDocumentation(): Promise<string | null> {
    const codeContext = getCodeContext();
    if (!codeContext) {
        return null;
    }

    const prompt = `
You are an AI-based documentation assistant. Your task is to analyze the given code and generate clear, concise, and properly formatted documentation comments.

### Instructions:
1. **Identify functions, classes, and important variables** that need documentation.
2. **Generate docstrings** in a format appropriate for the language (e.g., JSDoc for JavaScript/TypeScript, docstrings for Python).
3. **Integrate the documentation into the existing code** without modifying logic.

### User's Code:
\`\`\`
${codeContext}
\`\`\`

### Response Format:
Return a **valid JSON object** with the key "updated_code". Do not include any extra text or formatting.
`;

    try {
        vscode.window.showInformationMessage("Fetching AI-generated documentation...");

        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: prompt,
        });

        const rawResponse = response.text?.trim();
        if (!rawResponse) {
            vscode.window.showInformationMessage("No documentation updates suggested.");
            return null;
        }

        // Extract JSON safely using regex
        const jsonMatch = rawResponse.match(/\{[\s\S]*?\}/);
        if (!jsonMatch) {
            vscode.window.showErrorMessage("Error: AI response is not valid JSON.");
            return null;
        }

        const parsedData = JSON.parse(jsonMatch[0]);

        if (!parsedData.updated_code) {
            vscode.window.showInformationMessage("No documentation updates needed.");
            return null;
        }

        return parsedData.updated_code;
    } catch (error) {
        vscode.window.showErrorMessage("Error fetching documentation: " + (error instanceof Error ? error.message : "Unknown error"));
        return null;
    }
}

/**
 * Opens a virtual document for comparison.
 * @param content The text content of the virtual document.
 * @returns A promise resolving to the virtual document.
 */
async function createVirtualFile(content: string): Promise<vscode.TextDocument> {
    return await vscode.workspace.openTextDocument({ content, language: 'typescript' });
}

/**
 * Compares old and new code before applying updates.
 * @param originalText The current code in the editor.
 * @param updatedText The AI-generated documentation-enhanced code.
 */
async function compareAndApplyDocumentation(originalText: string, updatedText: string) {
    if (originalText === updatedText) {
        vscode.window.showInformationMessage("No changes detected. The file is already up to date.");
        return;
    }

    try {
        const virtualDoc = await createVirtualFile(updatedText);
        vscode.commands.executeCommand('vscode.diff', vscode.Uri.parse('untitled:original.ts'), virtualDoc.uri, "Documentation Changes");

        // Ask the user if they want to apply the changes
        vscode.window.showInformationMessage("Do you want to apply the suggested documentation updates?", "Yes", "No")
            .then(selection => {
                // Close the comparison window automatically
                vscode.commands.executeCommand('workbench.action.closeActiveEditor');

                if (selection === "Yes") {
                    applyCodeUpdate(updatedText);
                }
            });
    } catch (error) {
        vscode.window.showErrorMessage(`Error creating virtual file: ${error}`);
    }
}

/**
 * Replaces the current document's code with the updated version containing documentation.
 * @param updatedCode The new code snippet to be applied.
 */
function applyCodeUpdate(updatedCode: string) {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showErrorMessage("No active editor found.");
        return;
    }

    const document = editor.document;
    const fullRange = new vscode.Range(
        document.positionAt(0),
        document.positionAt(document.getText().length)
    );

    editor.edit(editBuilder => {
        editBuilder.replace(fullRange, updatedCode);
    });

    vscode.window.showInformationMessage("Documentation added successfully.");
}

const disposableDocs = vscode.commands.registerCommand('extension.addDocumentation', async () => {
    try {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active text editor found.');
            return;
        }

        const oldCode = editor.document.getText();
        if (!oldCode.trim()) {
            vscode.window.showErrorMessage('The file is empty. No documentation can be added.');
            return;
        }

        const newDocs = await addDocumentation();
        if (!newDocs) {
            vscode.window.showInformationMessage("No changes applied.");
            return;
        }

        await compareAndApplyDocumentation(oldCode, newDocs);
    } catch (error) {
        vscode.window.showErrorMessage(`Error adding documentation: ${error}`);
    }
});
