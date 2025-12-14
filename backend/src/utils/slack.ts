import axios from "axios";

const SLACK_WEBHOOK = process.env.SLACK_WEBHOOK || "";

export async function sendSlackBlocks(blocks: any[], color: string = "#36C5F0") {
  if (!SLACK_WEBHOOK) {
    console.log("[anon] Slack webhook missing!");
    return;
  }

  try {
    console.log("[anon] Sending Slack message...");

    await axios.post(SLACK_WEBHOOK, {
      attachments: [
        {
          color,
          blocks
        }
      ]
    });

    console.log("[anon] Slack sent successfully.");
  } catch (err: any) {
    console.log("[anon] Slack error:", err?.message || err);
  }
}
