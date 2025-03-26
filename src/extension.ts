import * as vscode from "vscode";
import axios from "axios";
import * as dotenv from "dotenv";
import * as path from "path";

// Load .env file
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  vscode.window.showErrorMessage("❌ Missing Gemini API Key! Add it to the .env file.");
}
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

export function activate(context: vscode.ExtensionContext) {
  const diagnosticCollection = vscode.languages.createDiagnosticCollection("bugDetector");

  vscode.workspace.onDidChangeTextDocument(async (event) => {
    const editor = vscode.window.activeTextEditor;
    if (!editor || event.document !== editor.document) {
      return;
    }
    await detectBugs(event.document, diagnosticCollection);
  });

  vscode.workspace.onDidOpenTextDocument(async (document) => {
    await detectBugs(document, diagnosticCollection);
  });

  context.subscriptions.push(diagnosticCollection);
}

async function detectBugs(document: vscode.TextDocument, collection: vscode.DiagnosticCollection) {
  if (!GEMINI_API_KEY) return;

  const text = document.getText();
  if (!text.trim()) return;

  try {
    const response = await axios.post(
      GEMINI_API_URL,
      {
        contents: [
          {
            parts: [
              { text: `Find bugs in the following code and return a JSON array of objects with 'message' and 'line':\n${text}` }
            ]
          }
        ]
      },
      {
        headers: { "Content-Type": "application/json" }
      }
    );

    const geminiResponse = response.data.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
    const bugReports = JSON.parse(geminiResponse);

    const diagnostics: vscode.Diagnostic[] = bugReports.map((bug: any) => {
      const line = Math.max(0, bug.line - 1);
      const range = new vscode.Range(new vscode.Position(line, 0), new vscode.Position(line, 100));
      return new vscode.Diagnostic(range, bug.message, vscode.DiagnosticSeverity.Warning);
    });

    collection.set(document.uri, diagnostics);
  } catch (error) {
    console.error("Error fetching from Gemini API:", error);
    vscode.window.showErrorMessage("⚠️ Failed to fetch bug reports from Gemini API.");
  }
}

export function deactivate() {}
