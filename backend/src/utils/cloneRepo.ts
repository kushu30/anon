import { spawnSync } from "child_process";
import path from "path";
import fs from "fs";

export async function cloneRepo(repoUrl: string, name: string) {
  const base = path.join(process.cwd(), "test-repos");
  if (!fs.existsSync(base)) {
    fs.mkdirSync(base, { recursive: true });
  }

  const repoPath = path.join(base, name);

  // Always fresh clone to avoid stale state
  if (fs.existsSync(repoPath)) {
    fs.rmSync(repoPath, { recursive: true, force: true });
  }

  spawnSync("git", ["clone", repoUrl, repoPath]);

  // Install dependencies so tests can run
  spawnSync("npm", ["install"], { cwd: repoPath });

  return repoPath;
}
