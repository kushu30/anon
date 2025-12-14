"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runTests = runTests;
const child_process_1 = require("child_process");
function runTests(repoPath) {
    const result = (0, child_process_1.spawnSync)("npm", ["test", "--silent"], { cwd: repoPath });
    const stdout = result.stdout.toString();
    const stderr = result.stderr.toString();
    const failures = [];
    if (stdout.includes("FAIL") || stderr.includes("FAIL")) {
        failures.push({ file: "sum.js", message: "Test failure detected" });
    }
    return failures;
}
