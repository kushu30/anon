import { spawn } from "child_process";

export async function applyFix(repoPath: string) {
  return new Promise((resolve, reject) => {
    const proc = spawn("git", ["add", "."], { cwd: repoPath });

    proc.on("close", () => {
      resolve(true);
    });

    proc.on("error", reject);
  });
}
