import express from "express";
import chalk from "chalk";
import { orchestrate } from "../agent/orchestrate";
import { runTests } from "../utils/runTests";
import { cloneRepo } from "../utils/cloneRepo";
import { sendSlackBlocks } from "../utils/slack";

const router = express.Router();

router.post("/run", async (req, res) => {
  const { repoUrl, name } = req.body;

  const repoPath = await cloneRepo(repoUrl, name);
  const failures = await runTests(repoPath);

  // No failures
  if (failures.length === 0) {
    const msg =
      chalk.blue("=== anon: Autonomous Fix Result ===\n\n") +
      chalk.green("All tests passed. No fixes required.\n");

    await sendSlackBlocks(
      [
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
      ],
      "#2ECC71"
    );

    return res.send(msg);
  }

  // Fix using Cline
  const fixResults = await orchestrate(repoPath, failures);

  // Re-run tests
  const newFailures = await runTests(repoPath);

  const statusOK = newFailures.length === 0;
  const statusIcon = statusOK ? "✅" : "⚠️";
  const statusText = statusOK ? "FIXED" : "FAILED";
  const color = statusOK ? "#2ECC71" : "#E74C3C";

  const patchText = fixResults.diff && fixResults.diff !== "NO_DIFF_FOUND"
    ? chalk.yellow(`\n${fixResults.diff}\n`)
    : chalk.red("No patch generated.\n");

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
  const formatted =
    chalk.blue("=== anon: Autonomous Fix Result ===\n\n") +
    chalk.red("Before:\n") +
    beforeList + "\n\n" +
    chalk.green("After:\n") +
    afterList + "\n\n" +
    chalk.yellow("Patch Applied:\n") +
    patchText + "\n" +
    chalk.blue("Status: ") + (statusOK ? chalk.green("FIXED") : chalk.red("FAILED")) + "\n";

  // Slack notification with Patch Preview
  await sendSlackBlocks(
    [
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
    ],
    color
  );

  res.send(formatted);
});

export default router;
