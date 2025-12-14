"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendSlackBlocks = sendSlackBlocks;
const axios_1 = __importDefault(require("axios"));
const SLACK_WEBHOOK = process.env.SLACK_WEBHOOK || "";
async function sendSlackBlocks(blocks, color = "#36C5F0") {
    if (!SLACK_WEBHOOK) {
        console.log("[anon] Slack webhook missing!");
        return;
    }
    try {
        console.log("[anon] Sending Slack message...");
        await axios_1.default.post(SLACK_WEBHOOK, {
            attachments: [
                {
                    color,
                    blocks
                }
            ]
        });
        console.log("[anon] Slack sent successfully.");
    }
    catch (err) {
        console.log("[anon] Slack error:", err?.message || err);
    }
}
