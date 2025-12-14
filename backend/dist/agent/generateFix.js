"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateFix = generateFix;
const child_process_1 = require("child_process");
const path_1 = __importDefault(require("path"));
async function generateFix(repoPath, failingFile, failureMessage) {
    const absPath = path_1.default.join(repoPath, failingFile);
    return new Promise((resolve, reject) => {
        const prompt = `Fix the bug indicated: ${failureMessage}. Return only a unified diff patch.`;
        const cline = (0, child_process_1.spawn)("cline", [
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
