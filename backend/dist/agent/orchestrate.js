"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.orchestrate = orchestrate;
const child_process_1 = require("child_process");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
async function orchestrate(repoPath, failures) {
    const testOutput = JSON.stringify(failures, null, 2);
    // Gather project files for context
    const files = fs_1.default.readdirSync(repoPath)
        .filter(f => f.endsWith(".js") || f.endsWith(".ts"))
        .map(f => path_1.default.join(repoPath, f));
    const context = files.map(file => {
        const code = fs_1.default.readFileSync(file, "utf-8");
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
    const result = (0, child_process_1.spawnSync)("cline", ["--yolo", instruction], { encoding: "utf-8", cwd: repoPath });
    const stdout = result.stdout || "";
    let diff = "";
    // 1. Try extracting diff block
    const diffMatch = stdout.match(/```diff([\s\S]*?)```/);
    if (diffMatch && diffMatch[1]) {
        diff = diffMatch[1].trim();
    }
    // 2. If no diff in Cline output, fallback to git diff
    if (!diff || diff.length < 3) {
        const gitDiff = (0, child_process_1.spawnSync)("git", ["diff"], { cwd: repoPath, encoding: "utf-8" });
        const gitOutput = gitDiff.stdout.trim();
        diff = gitOutput.length > 0 ? gitOutput : "NO_DIFF_FOUND";
    }
    return {
        diff,
        raw: stdout,
        success: diff !== "NO_DIFF_FOUND"
    };
}
