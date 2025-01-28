import { GoogleGenerativeAI } from "@google/generative-ai";
import * as vscode from "vscode";

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

let currentSystemInstruction = "";

export function generateSystemInstruction(commitFormat: string): string {
    // Generate two example commits based on the format
    const examples = generateExampleCommits(commitFormat);
    
    return `You are a commit message generator that follows a specific format.
Format: ${commitFormat}

Here are two examples of well-formatted commits:
${examples}

Instructions:
1. Always follow the exact format provided
2. Keep the type, scope, and description concise and meaningful
3. Provide detailed explanations in the body when necessary
4. Reference relevant issues or PRs in the footer
5. Highlight breaking changes prominently

Based on the git diff provided, generate a commit message that follows this format.`;
}

function generateExampleCommits(format: string): string {
    // Replace placeholders with realistic examples
    const example1 = format
        .replace("type", "feat")
        .replace("scope", "auth")
        .replace("description", "add OAuth2 authentication")
        .replace("Body explaining the changes in detail.", "Implemented OAuth2 authentication flow using Google provider.\n- Added login/logout endpoints\n- Created user session management\n- Added token refresh mechanism")
        .replace("Footer with references and breaking changes.", "Closes #123\nBREAKING CHANGE: Authentication header format changed");

    const example2 = format
        .replace("type", "fix")
        .replace("scope", "api")
        .replace("description", "handle rate limit errors")
        .replace("Body explaining the changes in detail.", "Added proper error handling for API rate limiting:\n- Implemented exponential backoff\n- Added retry mechanism\n- Improved error messages")
        .replace("Footer with references and breaking changes.", "Fixes #456\nRelated to #789");

    return `Example 1:\n${example1}\n\nExample 2:\n${example2}`;
}

export function updateSystemInstruction() {
    const config = vscode.workspace.getConfiguration("gitAutoCommit");
    const commitFormat = config.get<string>("commitFormat") || "";
    
    if (commitFormat) {
        currentSystemInstruction = generateSystemInstruction(commitFormat);
        vscode.window.showInformationMessage("Commit format system instruction updated");
    }
}

export function getCurrentSystemInstruction(): string {
    return currentSystemInstruction;
}

// Listen for configuration changes
vscode.workspace.onDidChangeConfiguration(e => {
    if (e.affectsConfiguration("gitAutoCommit.commitFormat")) {
        updateSystemInstruction();
    }
});
