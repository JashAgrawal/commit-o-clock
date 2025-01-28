import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

/**
 * Generates a commit message using AI based on file diffs and the last commit message.
 */
export async function generateCommitMessage(
  fileDiffs: Map<string, string>,
  lastCommitMessage: string,
  systemInstruction: string
): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Prepare the context from file diffs
    const diffContext = Array.from(fileDiffs.entries())
      .map(([file, diff]) => `File: ${file}\nDiff:\n${diff}`)
      .join("\n\n");

    const prompt = `${systemInstruction}

Previous commit message:
${lastCommitMessage}

Changes to commit:
${diffContext}

Generate a commit message following the specified format.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const commitMessage = response.text();

    return commitMessage.trim();
  } catch (error) {
    console.error("Error generating commit message:", error);
    return "chore: auto-commit changes\n\nAutomatic commit by Commit-o-Clock";
  }
}
