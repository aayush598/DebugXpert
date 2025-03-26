import * as vscode from 'vscode';
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: "AIzaSyBNP8L1vFKs_zrWQLRL32aoM9TO7GcInlM" });

export async function errorfix() {
    // Hardcoded sample code for testing
    const code = `
    function add(a, b) {
        return A + B;
    }

    console.log(add(5, 10));
    `;

    try {
        vscode.window.showInformationMessage("🔍 Analyzing hardcoded code...");

        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: `Check the following code for errors. Identify mistakes and suggest improvements in 40 words:\n\n${code}`
        });

        const analysis = response?.text?.trim() || "No analysis received.";

        // Show analysis result in popup
        vscode.window.showInformationMessage("✅ Code Analysis Complete:\n" + analysis);
    } catch (error) {
        vscode.window.showErrorMessage("❌ Error analyzing code: " + (error instanceof Error ? error.message : "Unknown error"));
    }
}
