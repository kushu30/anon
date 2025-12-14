"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const chalk_1 = __importDefault(require("chalk"));
const orchestrate_1 = require("../agent/orchestrate");
const runTests_1 = require("../utils/runTests");
const cloneRepo_1 = require("../utils/cloneRepo");
const slack_1 = require("../utils/slack");
const router = express_1.default.Router();
router.post("/run", async (req, res) => {
    const { repoUrl, name } = req.body;
    const repoPath = await (0, cloneRepo_1.cloneRepo)(repoUrl, name);
    const failures = await (0, runTests_1.runTests)(repoPath);
    // No failures
    if (failures.length === 0) {
        const msg = chalk_1.default.blue("=== anon: Autonomous Fix Result ===\n\n") +
            chalk_1.default.green("All tests passed. No fixes required.\n");
        await (0, slack_1.sendSlackBlocks)([
            {
                type: "header",
                text: {
                    type: "plain_text",
                    text: "anon — Autonomous Fix Report",
                    emoji: true
                }
            },
            {
                type: "section",
                text: {
                    type: "mrkdwn",
                    text: `Repository: <${repoUrl}|${name}>`
                }
            },
            {
                type: "section",
                text: {
                    type: "mrkdwn",
                    text: "*All tests passed. No fixes required.*"
                }
            }
        ], "#2ECC71");
        return res.send(msg);
    }
    // Fix using Cline
    const fixResults = await (0, orchestrate_1.orchestrate)(repoPath, failures);
    // Re-run tests
    const newFailures = await (0, runTests_1.runTests)(repoPath);
    const statusOK = newFailures.length === 0;
    const statusIcon = statusOK ? "✅" : "⚠️";
    const statusText = statusOK ? "FIXED" : "FAILED";
    const color = statusOK ? "#2ECC71" : "#E74C3C";
    const patchText = fixResults.diff && fixResults.diff !== "NO_DIFF_FOUND"
        ? chalk_1.default.yellow(`\n${fixResults.diff}\n`)
        : chalk_1.default.red("No patch generated.\n");
    const beforeList = failures.map(f => `- ${f.file}: ${f.message}`).join("\n");
    const afterList = newFailures.length
        ? newFailures.map(f => `- ${f.file}: ${f.message}`).join("\n")
        : "(no failures)";
    // Patch Preview (Slack)
    let patchPreview = "No patch generated.";
    if (fixResults.diff) {
        const lines = fixResults.diff.split("\n");
        const truncated = lines.slice(0, 15).join("\n");
        patchPreview = "```diff\n" + truncated + "\n```";
        if (lines.length > 15) {
            patchPreview += "\n... (truncated)";
        }
    }
    // Terminal output
    const formatted = chalk_1.default.blue("=== anon: Autonomous Fix Result ===\n\n") +
        chalk_1.default.red("Before:\n") +
        beforeList + "\n\n" +
        chalk_1.default.green("After:\n") +
        afterList + "\n\n" +
        chalk_1.default.yellow("Patch Applied:\n") +
        patchText + "\n" +
        chalk_1.default.blue("Status: ") + (statusOK ? chalk_1.default.green("FIXED") : chalk_1.default.red("FAILED")) + "\n";
    // Slack notification with Patch Preview
    await (0, slack_1.sendSlackBlocks)([
        {
            type: "header",
            text: {
                type: "plain_text",
                text: `anon — Autonomous Fix Report ${statusIcon}`,
                emoji: true
            }
        },
        {
            type: "section",
            text: {
                type: "mrkdwn",
                text: `*Repository:* <${repoUrl}|${name}>`
            }
        },
        {
            type: "section",
            fields: [
                {
                    type: "mrkdwn",
                    text: `*Status:* ${statusIcon} *${statusText}*`
                },
                {
                    type: "mrkdwn",
                    text: `*Patch Applied:* ${fixResults.diff ? "Yes" : "No"}`
                }
            ]
        },
        {
            type: "section",
            text: {
                type: "mrkdwn",
                text: `*Before:*\n${beforeList}`
            }
        },
        {
            type: "section",
            text: {
                type: "mrkdwn",
                text: `*After:*\n${afterList}`
            }
        },
        {
            type: "section",
            text: {
                type: "mrkdwn",
                text: `*Patch Preview:*\n${patchPreview}`
            }
        }
    ], color);
    res.send(formatted);
});
exports.default = router;
