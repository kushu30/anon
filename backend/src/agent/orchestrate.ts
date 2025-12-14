import { spawnSync } from "child_process";
import fs from "fs";
import path from "path";

export async function orchestrate(repoPath: string, failures: any[]) {
  const testOutput = JSON.stringify(failures, null, 2);

  // Gather project files for context
  const files = fs.readdirSync(repoPath)
    .filter(f => f.endsWith(".js") || f.endsWith(".ts"))
    .map(f => path.join(repoPath, f));

  const context = files.map(file => {
    const code = fs.readFileSync(file, "utf-8");
    return `FILE: ${file}\n${code}`;
  }).join("\n\n---\n\n");

  const instruction = `
You are anon, an autonomous debugging agent.

Your inputs:
1. Test failures:
${testOutput}

2. Project source code:
${context}

Your task:
- Identify which file is wrong.
- Fix ONLY the incorrect file.
- Output ONLY a unified diff patch.
- Wrap the patch inside \`\`\`diff and \`\`\`.

Do not output anything except the diff block.
`;

  // Invoke Cline
  const result = spawnSync(
    "cline",
    ["--yolo", instruction],
    { encoding: "utf-8", cwd: repoPath }
  );

  const stdout = result.stdout || "";
  let diff = "";

  // 1. Try extracting diff block
  const diffMatch = stdout.match(/```diff([\s\S]*?)```/);
  if (diffMatch && diffMatch[1]) {
    diff = diffMatch[1].trim();
  }

  // 2. If no diff in Cline output, fallback to git diff
  if (!diff || diff.length < 3) {
    const gitDiff = spawnSync("git", ["diff"], { cwd: repoPath, encoding: "utf-8" });
    const gitOutput = gitDiff.stdout.trim();
    diff = gitOutput.length > 0 ? gitOutput : "NO_DIFF_FOUND";
  }

  return {
    diff,
    raw: stdout,
    success: diff !== "NO_DIFF_FOUND"
  };
}
