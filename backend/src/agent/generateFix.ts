import { spawn } from "child_process";
import path from "path";

export async function generateFix(repoPath: string, failingFile: string, failureMessage: string) {
  const absPath = path.join(repoPath, failingFile);

  return new Promise((resolve, reject) => {
    const prompt = `Fix the bug indicated: ${failureMessage}. Return only a unified diff patch.`;

    const cline = spawn("cline", [
      "--file",
      absPath,
      "--yolo",
      prompt
    ]);

    let stdout = "";
    let stderr = "";

    cline.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    cline.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    cline.on("close", (code) => {
      resolve({ stdout, stderr, code });
    });

    cline.on("error", reject);
  });
}
