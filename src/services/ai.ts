import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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
Last Commit Message (just for refrence of what we did last time the new message should describe the changes done in this commit):
"${lastCommitMessage}"

Current Changes (git diff of the changes):
${changesSummary}

summarize the work done in the last 30 minutes and give me best suitable commit message for it describing the work done in the best and shortest way possible, no jargon, no other shit, just commit message in below format".
example commit message :
 feat: add a new feature

 description:
 in short 1 liner bullet points here not much details

 why's this feature/fix needed?

 if(feat){
  predict the status of the work being done here and rate its progress in the below format (out of 10 like)
  eg:-[#####-----] 5/10
 }

 if(fix){
 before vs after effects.
 }
  `;

  try {
    const aiResponse = await model.generateContent(prompt); // Replace with actual Gemini AI call
    const message = aiResponse.response.text();
    if (message.includes("Please provide")) {
      return "Manual commit (AI unavailable).";
    }
    return message.trim();
  } catch (error) {
    console.error("Error generating commit message with AI:", error);
    return "Manual commit (AI unavailable).";
  }
}
