import * as vscode from "vscode";
import { SimpleGit, simpleGit } from "simple-git";
import * as dotenv from "dotenv";
import { commitChanges, initializeGit } from "./services/git-helper";

dotenv.config();

const COMMIT_INTERVAL = 60 * 1000; // 1 minute
const autoCommitIntervals = new Map<string, NodeJS.Timeout>();
const scheduledCommitTimeouts = new Map<string, NodeJS.Timeout>();

function getCommitIntervalFromSettings(): number {
  const config = vscode.workspace.getConfiguration("gitAutoCommit");
  const interval = config.get<number>("interval") || 1; // Default to 1 minute if not set
  return interval * 60 * 1000;
}

function getAutoCommitEnabledFromSettings(): boolean {
  const config = vscode.workspace.getConfiguration("gitAutoCommit");
  return config.get<boolean>("autoCommitEnabled") ?? true; // Default to true if not set
}

function getScheduledCommitSettings(): { enabled: boolean; time: string } {
  const config = vscode.workspace.getConfiguration("gitAutoCommit");
  return {
    enabled: config.get<boolean>("useScheduledCommit") ?? false,
    time: config.get<string>("scheduledTime") ?? ""
  };
}

function calculateNextScheduledTime(timeStr: string): number {
  const [hours, minutes] = timeStr.split(":").map(Number);
  const now = new Date();
  const scheduledTime = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    hours,
    minutes
  );

  // If the scheduled time has already passed today, schedule for tomorrow
  if (scheduledTime.getTime() < now.getTime()) {
    scheduledTime.setDate(scheduledTime.getDate() + 1);
  }

  return scheduledTime.getTime() - now.getTime();
}

async function scheduleCommit(
  workspacePath: string,
  git: SimpleGit,
  timeStr: string
): Promise<NodeJS.Timeout> {
  const msUntilNextCommit = calculateNextScheduledTime(timeStr);

  const timeoutId = setTimeout(async () => {
    await commitChanges(workspacePath, git);
    // Schedule next day's commit after completing this one
    scheduleCommit(workspacePath, git, timeStr);
  }, msUntilNextCommit);

  return timeoutId;
}

/**
 * Tracks changes and commits them automatically at regular intervals.
 */
async function autoCommit(
  workspacePath: string,
  git: SimpleGit,
  interval: number
) {
  const intervalId = setInterval(async () => {
    await commitChanges(workspacePath, git);
  }, interval);

  return intervalId;
}

async function startAutoCommit(workspacePath: string, git: SimpleGit, interval: number): Promise<NodeJS.Timeout> {
  const intervalId = await autoCommit(workspacePath, git, interval);
  autoCommitIntervals.set(workspacePath, intervalId);
  return intervalId;
}

function stopAutoCommit(workspacePath: string) {
  const intervalId = autoCommitIntervals.get(workspacePath);
  if (intervalId) {
    clearInterval(intervalId);
    autoCommitIntervals.delete(workspacePath);
  }
}

/**
 * Activates the VS Code extension by setting up Git initialization and auto-committing.
 */
export async function activate(context: vscode.ExtensionContext) {
  const commitInterval = getCommitIntervalFromSettings();
  const isAutoCommitEnabled = getAutoCommitEnabledFromSettings();
  const scheduledCommitSettings = getScheduledCommitSettings();

  const config = vscode.workspace.getConfiguration("gitAutoCommit");
  const inviteCode = config.get<string>("inviteCode") || "";

  if (inviteCode !== "COMMIE") {
    vscode.window.showErrorMessage(
      "Please setup inviteCode in vscode settings to continue to use the settings"
    );
    return;
  } else {
    vscode.window.showInformationMessage("Commit-o-clock Extension Activated!");
  }

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

    // Set up auto-commit interval if enabled
    if (isAutoCommitEnabled) {
      const intervalId = await startAutoCommit(workspacePath, git, commitInterval);
      context.subscriptions.push({
        dispose: () => {
          clearInterval(intervalId);
        },
      });
    }

    // Set up scheduled commit if enabled
    if (scheduledCommitSettings.enabled && scheduledCommitSettings.time) {
      const timeoutId = await scheduleCommit(
        workspacePath,
        git,
        scheduledCommitSettings.time
      );
      scheduledCommitTimeouts.set(workspacePath, timeoutId);
      context.subscriptions.push({
        dispose: () => {
          clearTimeout(timeoutId);
        },
      });
    }
  }

  // Register command to toggle auto-commit
  context.subscriptions.push(
    vscode.commands.registerCommand("extension.toggleAutoCommit", async () => {
      const config = vscode.workspace.getConfiguration("gitAutoCommit");
      const currentValue = getAutoCommitEnabledFromSettings();
      
      if (!currentValue) {
        // Enabling auto-commit
        for (const [workspacePath, git] of gitInstances) {
          await startAutoCommit(workspacePath, git, commitInterval);
        }
        vscode.window.showInformationMessage("Auto-commit enabled");
      } else {
        // Disabling auto-commit
        for (const [workspacePath] of gitInstances) {
          stopAutoCommit(workspacePath);
        }
        vscode.window.showInformationMessage("Auto-commit disabled");
      }
    })
  );

  // Register command to toggle scheduled commit
  context.subscriptions.push(
    vscode.commands.registerCommand("extension.toggleScheduledCommit", async () => {
      const config = vscode.workspace.getConfiguration("gitAutoCommit");
      const currentSettings = getScheduledCommitSettings();
      
      if (!currentSettings.enabled) {
        // Show input box to get time when enabling
        const time = await vscode.window.showInputBox({
          prompt: "Enter the time for daily commits (24-hour format, e.g., 14:30)",
          validateInput: (value) => {
            const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
            return timeRegex.test(value) ? null : "Please enter time in 24-hour format (HH:mm)";
          }
        });

        if (time) {
          await config.update("scheduledTime", time, vscode.ConfigurationTarget.Global);
          await config.update("useScheduledCommit", true, vscode.ConfigurationTarget.Global);
          
          // Start scheduled commits
          for (const [workspacePath, git] of gitInstances) {
            const timeoutId = await scheduleCommit(workspacePath, git, time);
            scheduledCommitTimeouts.set(workspacePath, timeoutId);
            context.subscriptions.push({
              dispose: () => {
                clearTimeout(timeoutId);
              },
            });
          }
          vscode.window.showInformationMessage(`Scheduled commits enabled for ${time}`);
        }
      } else {
        // Disable scheduled commits
        await config.update("useScheduledCommit", false, vscode.ConfigurationTarget.Global);
        for (const [workspacePath, timeoutId] of scheduledCommitTimeouts) {
          clearTimeout(timeoutId);
          scheduledCommitTimeouts.delete(workspacePath);
        }
        vscode.window.showInformationMessage("Scheduled commits disabled");
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("extension.aiCommit", async () => {
      for (const [workspacePath, git] of gitInstances) {
        await commitChanges(workspacePath, git);
      }
    })
  );
}

/**
 * Deactivates the VS Code extension.
 */
export function deactivate() {
  console.log("Git Extension Deactivated!");
  vscode.window.showInformationMessage("Commit-o-clock Extension Deavtivated!");
}
