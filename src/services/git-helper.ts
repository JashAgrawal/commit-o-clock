import * as vscode from "vscode";
import { SimpleGit, simpleGit } from "simple-git";
import moment from "moment";
import * as fs from "fs";
import * as path from "path";
import { generateCommitMessage } from "./ai";

/**
 * Initializes Git in the workspace if not already initialized.
 */
export async function initializeGit(workspacePath: string): Promise<SimpleGit> {
  const gitPath = path.join(workspacePath, ".git");
  const git = simpleGit(workspacePath);

  if (!fs.existsSync(gitPath)) {
    await git.init();
    vscode.window.showInformationMessage(`Git initialized in ${workspacePath}`);
  }
  return git;
}

/**
 * Gets the list of changed files and their diffs tracked by Git.
 */
export async function getChangedFilesWithDiffs(
  git: SimpleGit
): Promise<Map<string, string>> {
  const status = await git.status();
  console.log(status);
  const changedFilesWithDiffs = new Map<string, string>();

  const files = [
    ...status.staged,
    ...status.not_added,
    ...status.modified,
    ...status.created,
    ...status.deleted.map((file) => file),
    ...status.renamed.map((file) => file.to),
  ];

  for (const file of files) {
    try {
      // Get the diff for each file
      await git.diff(["--", file], (err, diff) => {
        console.log("err", err);
        console.log("diff", diff);
        changedFilesWithDiffs.set(file, diff);
      });
    } catch (error) {
      console.error(`Failed to get diff for file ${file}:`, error);
    }
  }

  return changedFilesWithDiffs;
}

/**
 * Gets the last commit message from the Git repository.
 */
export async function getLastCommitMessage(git: SimpleGit): Promise<string> {
  try {
    const log = await git.log({ maxCount: 1 });
    return log.latest?.message || "No previous commit message found.";
  } catch (error) {
    console.error("Error fetching the last commit message:", error);
    return "No previous commit message found.";
  }
}

/**
 * Commits tracked changes in the workspace using Git.
 */
export async function commitChanges(workspacePath: string, git: SimpleGit) {
  const fileDiffs = await getChangedFilesWithDiffs(git);

  if (fileDiffs.size === 0) {
    vscode.window.showInformationMessage(
      `No changes to commit in ${workspacePath}.`
    );
    return;
  }

  const lastCommitMessage = await getLastCommitMessage(git);
  const commitMessage = await generateCommitMessage(
    fileDiffs,
    lastCommitMessage
  );

  try {
    await git.add(Array.from(fileDiffs.keys())); // Stage only the changed files
    const now = new Date();

    await git.commit(
      `${moment(now).format("ll LT")} - ${
        commitMessage.split("\n")[0]
      }\n\n${commitMessage}`
    );

    vscode.window.showInformationMessage(
      `Changes committed in ${workspacePath}`
    );
  } catch (error) {
    console.error("Error committing changes:", error);
  }
}
