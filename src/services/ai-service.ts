import * as vscode from "vscode";
import { PromptBuilder } from "./promptBuilder";

const promptBuilder = new PromptBuilder();

let currentSystemInstruction = "";

const DEFAULT_SYSTEM_INSTRUCTION = `
Format:
<type>(<scope>): <title>

<description>

<footer>
BreakingChange
Before / After
</footer>

Types:
- feat: A new feature
- fix: A bug fix
- docs: Documentation changes
- style: Code style changes (formatting, missing semi colons, etc)
- refactor: Code changes that neither fixes a bug nor adds a feature
- perf: Code changes that improve performance
- test: Adding missing tests
- chore: Changes to the build process or auxiliary tools

Instructions:
1. Keep the type and scope concise
2. Write clear, actionable descriptions
3. Provide detailed explanations in the body .
4. Highlight breaking changes and effects .

Example:
feat(auth): implement JWT authentication

- Add JWT token generation and validation
- Create middleware for protected routes
- Add refresh token mechanism
- Implement token blacklisting

BREAKING CHANGE: Authentication header now requires Bearer token`;

export function generateSystemInstruction(commitFormat: string): string {
  promptBuilder.setFormat(commitFormat);
  return promptBuilder.buildSystemInstruction();
}

export function updateSystemInstruction() {
  const config = vscode.workspace.getConfiguration("gitAutoCommit");
  const commitFormat = config.get<string>("commitFormat") || "";

  currentSystemInstruction = generateSystemInstruction(commitFormat);
  if (commitFormat) {
    vscode.window.showInformationMessage(
      "Custom commit format system instruction updated"
    );
  } else {
    vscode.window.showInformationMessage(
      "Using default conventional commit format"
    );
  }
}

export function getCurrentSystemInstruction(): string {
  return promptBuilder.getCurrentSystemInstruction();
}

// Listen for configuration changes
vscode.workspace.onDidChangeConfiguration((e) => {
  if (e.affectsConfiguration("gitAutoCommit.commitFormat")) {
    updateSystemInstruction();
  }
});
