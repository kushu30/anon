"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRootCause = void 0;
const generateRootCause = (failures) => {
    if (!failures.length) {
        return "No test failures found.";
    }
    const f = failures[0];
    return `
A test failed.

File: ${f.file}
Message: ${f.message}

Stack trace:
${f.stack.join("\n")}

Identify the root cause and propose the minimal fix.
`;
};
exports.generateRootCause = generateRootCause;
