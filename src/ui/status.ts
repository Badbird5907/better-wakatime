import * as vscode from "vscode";

export class StatusBar {
  private statusBarItem: vscode.StatusBarItem;
  constructor() {
    this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 3);
    this.statusBarItem.text = "Wakatime";
    this.statusBarItem.tooltip = "Better Wakatime";
  }

  setText(text: string) {
    this.statusBarItem.text = text;
  }

  show() {
    this.statusBarItem.show();
  }

  hide() {
    this.statusBarItem.hide();
  }
}