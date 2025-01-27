import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from "dotenv";
import { systemInstruction } from "./ai-helper";

dotenv.config();

const genAI = new GoogleGenerativeAI(
  process.env.GOOGLE_API_KEY || "AIzaSyC_ZXJb3JgX1Bj09JNcWBfXhefoTbSBrkQ"
);
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash-8b",
  systemInstruction: systemInstruction,
});

/**
 * Generates a commit message using AI based on file diffs and the last commit message.
 */
export async function generateCommitMessage(
  fileDiffs: Map<string, string>,
  lastCommitMessage: string
): Promise<string> {
  console.log(fileDiffs);
  const changesSummary = Array.from(fileDiffs.entries())
    .map(([file, diff]) => `File: ${file}\nChanges:\n${diff}`)
    .join("\n\n");

  const prompt = `
  Last Commit Message: 
  ${lastCommitMessage}

  Current Changes:
  ${changesSummary}
  `;

  try {
    console.log(prompt);
    const aiResponse = await model.generateContent(prompt); // Replace with actual Gemini AI call
    const message = aiResponse.response.text();
    console.log(message);
    return message.trim();
  } catch (error) {
    console.error("Error generating commit message with AI:", error);
    return "Manual commit (AI unavailable).";
  }
}
