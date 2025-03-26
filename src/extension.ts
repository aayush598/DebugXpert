
import * as vscode from 'vscode';
import { activateMain } from './main';

export function activate(context: vscode.ExtensionContext) {

	console.log('Congratulations, your extension "nexora" is now active!');

	const disposable = vscode.commands.registerCommand('nexora.helloWorld', () => {
	
		activateMain();
	});

	context.subscriptions.push(disposable);
}

export function deactivate() {}
