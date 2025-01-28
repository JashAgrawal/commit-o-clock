import { GoogleGenerativeAI } from "@google/generative-ai";
import { PromptBuilder } from "./promptBuilder";
import * as dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const promptBuilder = new PromptBuilder();

/**
 * Generates a commit message using AI based on file diffs and the last commit message.
 */
export async function generateCommitMessage(
  fileDiffs: Map<string, string>,
  lastCommitMessage: string,
  systemInstruction: string
): Promise<string> {
  try {
    console.log(systemInstruction);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-8b",systemInstruction });

    // Prepare the context from file diffs
    const diffContext = Array.from(fileDiffs.entries())
      .map(([file, diff]) => `File: ${file}\nDiff:\n${diff}`)
      .join("\n\n");

    // Set the format from system instruction and build the complete prompt
    const prompt = promptBuilder.buildInputPrompt(lastCommitMessage, diffContext);
    console.log(prompt);
    const result = await model.generateContent(prompt);
    const response = result.response;
    const commitMessage = response.text();

    return commitMessage.trim();
  } catch (error) {
    console.error("Error generating commit message:", error);
    return "chore: auto-commit changes\n\nAutomatic commit by Commit-o-Clock";
  }
}
