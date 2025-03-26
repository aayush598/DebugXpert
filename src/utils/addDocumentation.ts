import * as vscode from 'vscode';
import { GoogleGenAI } from "@google/genai";
import * as dotenv from 'dotenv';

dotenv.config();

const ai = new GoogleGenAI({ apiKey: "AIzaSyBNP8L1vFKs_zrWQLRL32aoM9TO7GcInlM"  });

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
 */
export async function addDocumentation() {
    const codeContext = getCodeContext();
    if (!codeContext) return;

    const prompt = `
You are an AI-based documentation assistant. Your task is to analyze the given code and generate clear, concise, and properly formatted documentation comments.

### Instructions:
1. **Identify functions, classes, and important variables** that need documentation.
2. **Generate docstrings** in a format appropriate for the language (e.g., JSDoc for JavaScript/TypeScript, docstrings for Python).
3. **Integrate the documentation into the existing code** without modifying logic.

### Example Input:
\`\`\`typescript
function addNumbers(a: number, b: number): number {
    return a + b;
}
\`\`\`

### Expected Output:
{
  "updated_code": "/**\\n * Adds two numbers together.\\n * @param a - First number\\n * @param b - Second number\\n * @returns The sum of both numbers.\\n */\\nfunction addNumbers(a: number, b: number): number {\\n    return a + b;\\n}"
}

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
            return;
        }

        vscode.window.showInformationMessage(`Raw Response:\n${rawResponse}`);

        // Extract JSON safely using regex
        const jsonMatch = rawResponse.match(/\{[\s\S]*?\}/);
        if (!jsonMatch) {
            vscode.window.showErrorMessage("Error: AI response is not valid JSON.");
            return;
        }

        const jsonData = jsonMatch[0]; // Extract the matched JSON string
        const parsedData = JSON.parse(jsonData);

        if (!parsedData.updated_code) {
            vscode.window.showInformationMessage("No documentation updates needed.");
            return;
        }

        const updatedCode = parsedData.updated_code;

        // Show the updated code and ask for confirmation
        const userChoice = await vscode.window.showInformationMessage(
            `AI suggests the following documentation:\n\n${updatedCode}\n\nDo you want to apply the changes?`,
            "Yes", "No"
        );

        if (userChoice === "Yes") {
            applyCodeUpdate(updatedCode);
        }
    } catch (error) {
        vscode.window.showErrorMessage("Error fetching documentation: " + (error instanceof Error ? error.message : "Unknown error"));
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
