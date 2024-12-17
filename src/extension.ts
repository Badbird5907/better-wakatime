import * as vscode from 'vscode';
import { StatusBar } from './ui/status';
import { currentState, heartbeat } from './wakatime';
import { logger } from './logger';

let disposables: vscode.Disposable[] = [];
export function activate(context: vscode.ExtensionContext) {
	console.log('better-wakatime is activated');
	logger.info('better-wakatime is activated');
	context.globalState.setKeysForSync(["better-wakatime.apiConfig"]);
	
	const statusBar = new StatusBar();

	const subs: vscode.Disposable[] = [];
	const edited = () => heartbeat(true);
	const selected = () => heartbeat(false);
	vscode.workspace.onDidSaveTextDocument(edited, subs);
	vscode.window.onDidChangeTextEditorSelection(selected, subs);
	vscode.window.onDidChangeActiveTextEditor(selected, subs);
	
	vscode.tasks.onDidStartTask((e) => {
		if (e.execution.task.isBackground || (e.execution.task.detail?.includes("watch"))) {
			return;
		}
		edited();
		currentState.compiling = true;
	}, subs);
	vscode.tasks.onDidEndTask(() => {
		edited();
		currentState.compiling = false;
	}, subs);

	vscode.debug.onDidChangeActiveDebugSession(edited, subs);
	vscode.debug.onDidChangeBreakpoints(edited, subs);
	vscode.debug.onDidStartDebugSession(() => {
		edited();
		currentState.debugging = true;
	}, subs);
	vscode.debug.onDidTerminateDebugSession(() => {
		edited();
		currentState.debugging = false;
	}, subs);

	disposables.push(...subs);
}

export function deactivate() {
	disposables.forEach((d) => d.dispose());
}
