"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cloneRepo = cloneRepo;
const child_process_1 = require("child_process");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
async function cloneRepo(repoUrl, name) {
    const base = path_1.default.join(process.cwd(), "test-repos");
    if (!fs_1.default.existsSync(base)) {
        fs_1.default.mkdirSync(base, { recursive: true });
    }
    const repoPath = path_1.default.join(base, name);
    // Always fresh clone to avoid stale state
    if (fs_1.default.existsSync(repoPath)) {
        fs_1.default.rmSync(repoPath, { recursive: true, force: true });
    }
    (0, child_process_1.spawnSync)("git", ["clone", repoUrl, repoPath]);
    // Install dependencies so tests can run
    (0, child_process_1.spawnSync)("npm", ["install"], { cwd: repoPath });
    return repoPath;
}
