"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runTests = void 0;
const exec_1 = require("../utils/exec");
const runTests = async (path) => {
    const install = await (0, exec_1.runCommand)(`cd ${path} && npm install`);
    const test = await (0, exec_1.runCommand)(`cd ${path} && npm test`);
    return { install, test };
};
exports.runTests = runTests;
