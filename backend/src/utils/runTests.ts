import { spawnSync } from "child_process";

export function runTests(repoPath: string) {
  const result = spawnSync("npm", ["test", "--silent"], { cwd: repoPath });
  
  const stdout = result.stdout.toString();
  const stderr = result.stderr.toString();
  
  const failures = [];

  if (stdout.includes("FAIL") || stderr.includes("FAIL")) {
    failures.push({ file: "sum.js", message: "Test failure detected" });
  }

  return failures;
}
