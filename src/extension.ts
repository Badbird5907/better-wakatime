import * as vscode from 'vscode';
import { StatusBar } from './ui/status';
import { currentState, heartbeat } from './wakatime';
import { logger } from './logger';

let disposables: vscode.Disposable[] = [];
export let statusBar: StatusBar;
export function activate(context: vscode.ExtensionContext) {
	context.globalState.setKeysForSync(["better-wakatime.apiConfig"]);
	
	statusBar = new StatusBar();

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

	statusBar.setText("WakaTime: Initialized!");
	statusBar.show();
}

export function deactivate() {
	disposables.forEach((d) => d.dispose());
	statusBar.bar().dispose();
}
