import * as vscode from 'vscode';
import { GoogleGenAI } from "@google/genai";
import * as dotenv from 'dotenv';

dotenv.config();

const ai = new GoogleGenAI({ apiKey: "AIzaSyBNP8L1vFKs_zrWQLRL32aoM9TO7GcInlM" });

export async function evaluateCode(personalizationData: any) {
    const editor = vscode.window.activeTextEditor;

    if (!editor) {
        vscode.window.showErrorMessage("No active file open. Please open a file to evaluate.");
        return;
    }

    const code = editor.document.getText().trim();

    if (!code) {
        vscode.window.showErrorMessage("The file is empty. Please provide code to evaluate.");
        return;
    }

    const prompt = `
You are an expert in software engineering and code quality analysis. Evaluate the following code and generate a structured report in Markdown format.

### **Evaluation Criteria:**
1. **Cyclomatic Complexity**  
2. **Maintainability Index**  
3. **Lines of Code (LOC)**  
4. **Halstead Complexity Measures**  
5. **Code Duplication**  
6. **Code Coverage**  
7. **Error Density**  
8. **Documentation & Comments Ratio**  
9. **Coupling & Cohesion**  
10. **Security Vulnerabilities**  
11. **Performance Metrics**  

### **Code to Evaluate:**
\`\`\`python
${code}
\`\`\`

Generate a well-structured Markdown report with clear sections, headings, and recommendations.

Additional Information :-
- **Tech Stack:** ${personalizationData.techStack}
- **Project Name:** ${personalizationData.projectName}
- **System User:** ${personalizationData.systemUser}
`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: prompt,
        });

        const evaluation = response.text?.trim() || "Failed to generate evaluation.";

        if (!evaluation) {
            vscode.window.showErrorMessage("No evaluation response received.");
            return;
        }

        const markdownContent = `# 📌 Code Quality Analysis Report\n\n${evaluation}`;

        vscode.window.showInformationMessage("Code evaluation complete. Opening results...");

        // Open results in a new Markdown document
        const document = await vscode.workspace.openTextDocument({
            content: markdownContent,
            language: "markdown"
        });

        await vscode.window.showTextDocument(document, vscode.ViewColumn.Beside);

    } catch (error) {
        vscode.window.showErrorMessage("Error evaluating code: " + (error instanceof Error ? error.message : "Unknown error"));
    }
}
