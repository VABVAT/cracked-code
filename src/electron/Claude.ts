const dotenv = require("dotenv");
const path = require("path");
const { isDev } = require("./util.js");
const Anthropic = require("@anthropic-ai/sdk"); // Ensure SDK is installed
const { app} = require("electron");
dotenv.config({ 
  path: path.join(app.getAppPath(), isDev() ? ".env" : "../dist-electron/.env") 
});
const API_KEYS = process.env.CLAUDE ? process.env.CLAUDE.split(",") : [];

let apiKeyIndex = 0; // ✅ Global index to track the last used API key
// ✅ Function to get the next API key in a round-robin fashion
function getNextApiKey() {
  if (API_KEYS.length === 0) {
    return null;
  }
  const key = API_KEYS[apiKeyIndex]; // Get the current API key
  apiKeyIndex = (apiKeyIndex + 1) % API_KEYS.length; // Move to the next key
  return key;
}
const thisApi = getNextApiKey();
const anthropic = new Anthropic({
  apiKey: String(thisApi) // API key from environment variable
});

export async function Claude(prompt:string) {
    prompt == null ? "" : prompt
    try {
    const msg = await anthropic.messages.create({
      model: "claude-3-7-sonnet-20250219",
      max_tokens: 2500,
      messages: [{ role: "user", content: prompt }],
    });
    return msg.content[0].text;
  } catch (error) {
    console.error("❌ Error fetching response:", error);
    return null;
  }
}
