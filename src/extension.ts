
import * as vscode from 'vscode';
import { openFile } from './utils/fileNavigation';

export function activate(context: vscode.ExtensionContext) {

	console.log('Congratulations, your extension "nexora" is now active!');

	const disposable = vscode.commands.registerCommand('nexora.helloWorld', () => {
	
		openFile();
	});

	context.subscriptions.push(disposable);
}

export function deactivate() {}
