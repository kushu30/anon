"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyFix = applyFix;
const child_process_1 = require("child_process");
async function applyFix(repoPath) {
    return new Promise((resolve, reject) => {
        const proc = (0, child_process_1.spawn)("git", ["add", "."], { cwd: repoPath });
        proc.on("close", () => {
            resolve(true);
        });
        proc.on("error", reject);
    });
}
