import * as vscode from 'vscode';
import { GoogleGenAI } from "@google/genai";
import * as dotenv from 'dotenv';

dotenv.config();

const ai = new GoogleGenAI({ apiKey: "AIzaSyBNP8L1vFKs_zrWQLRL32aoM9TO7GcInlM" });

/**
 * Fetches the current open file's code as context.
 * @returns The full text of the open document.
 */
export function getCodeContext(): string {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showErrorMessage("No active editor found.");
        return "";
    }
    return editor.document.getText();
}

/**
 * Calls the Gemini AI API for intelligent autocompletion based on comments.
 */
export async function fetchAutocompletions() {
    const codeContext = getCodeContext();
    if (!codeContext) return;

    const prompt = `
You are an AI-based code assistant. The user has written some comments indicating code that needs to be completed.
Your task is to intelligently generate the missing code while keeping the overall coding style and context.

### Instructions:
1. Identify comments that describe incomplete or missing code.
2. Generate the missing code and integrate it seamlessly.
3. If no updates are needed, return an empty response.

### Example Input:
\`\`\`python
# Define a function to calculate factorial
def factorial(n):
    # TODO: Implement the factorial logic
    return result
\`\`\`

### Expected JSON Output:
{
  "updated_code": "def factorial(n):\\n    if n == 0 or n == 1:\\n        return 1\\n    return n * factorial(n - 1)"
}

### User's Code:
\`\`\`
${codeContext}
\`\`\`

### Response Format:
Return a **valid JSON object** with the key "updated_code". Do not include any extra text, explanations, or formatting.
`;

    try {
        vscode.window.showInformationMessage(`Fetching AI code completion...`);

        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: prompt,
        });

        const rawResponse = response.text?.trim();
        if (!rawResponse) {
            vscode.window.showInformationMessage("No code updates suggested.");
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
            vscode.window.showInformationMessage("No code updates needed.");
            return;
        }

        const updatedCode = parsedData.updated_code;

        // Show the updated code and ask for confirmation
        const userChoice = await vscode.window.showInformationMessage(
            `AI suggests the following update:\n\n${updatedCode}\n\nDo you want to apply the changes?`,
            "Yes", "No"
        );

        if (userChoice === "Yes") {
            applyCodeUpdate(updatedCode);
        }
    } catch (error) {
        vscode.window.showErrorMessage("Error fetching code updates: " + (error instanceof Error ? error.message : "Unknown error"));
    }
}

/**
 * Replaces the current document's code with the updated code.
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

    vscode.window.showInformationMessage("Code updated successfully.");
}
