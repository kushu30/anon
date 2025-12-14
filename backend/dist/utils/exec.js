"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runCommand = void 0;
const child_process_1 = require("child_process");
const runCommand = (cmd) => {
    return new Promise((resolve) => {
        (0, child_process_1.exec)(cmd, { maxBuffer: 1024 * 1024 }, (error, stdout, stderr) => {
            const code = error ? 1 : 0;
            resolve({ stdout, stderr, code });
        });
    });
};
exports.runCommand = runCommand;
