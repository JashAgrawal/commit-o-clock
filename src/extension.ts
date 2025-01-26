import * as vscode from "vscode";
import { SimpleGit, simpleGit } from "simple-git";
import * as dotenv from "dotenv";
import { commitChanges, initializeGit } from "./services/git-helper";

dotenv.config();

function getCommitIntervalFromSettings(): number {
  const config = vscode.workspace.getConfiguration("gitAutoCommit");
  const interval = config.get<number>("interval") || 1; // Default to 1 minute if not set
  return interval;
}

/**
 * Tracks changes and commits them automatically at regular intervals.
 */
async function autoCommit(
  workspacePath: string,
  git: SimpleGit,
  interval: number = 60 * 1000
) {
  const intervalId = setInterval(async () => {
    await commitChanges(workspacePath, git);
  }, interval);

  return intervalId;
}

/**
 * Activates the VS Code extension by setting up Git initialization and auto-committing.
 */
export async function activate(context: vscode.ExtensionContext) {
  const commitInterval = getCommitIntervalFromSettings() * 60 * 1000;

  const workspaceFolders = vscode.workspace.workspaceFolders;

  if (!workspaceFolders || workspaceFolders.length === 0) {
    vscode.window.showErrorMessage(
      "Please open a workspace to enable Git tracking."
    );
    return;
  }

  const gitInstances = new Map<string, SimpleGit>();

  //Create command to commit

  for (const folder of workspaceFolders) {
    const workspacePath = folder.uri.fsPath;
    const git = await initializeGit(workspacePath);
    gitInstances.set(workspacePath, git);

    // Set up auto-commit interval
    const intervalId = await autoCommit(workspacePath, git, commitInterval);

    context.subscriptions.push({
      dispose: () => {
        clearInterval(intervalId);
      },
    });
  }

  context.subscriptions.push(
    vscode.commands.registerCommand("extension.aiCommit", async () => {
      for (const [workspacePath, git] of gitInstances) {
        await commitChanges(workspacePath, git);
      }
    })
  );

  vscode.window.showInformationMessage("Git Extension Activated!");
}

/**
 * Deactivates the VS Code extension.
 */
export function deactivate() {
  console.log("Git Extension Deactivated!");
  vscode.window.showInformationMessage("Git Extension Activated!");
}
