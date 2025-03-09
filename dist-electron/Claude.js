"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Claude = Claude;
const dotenv = require("dotenv");
const path = require("path");
const { isDev } = require("./util.js");
const Anthropic = require("@anthropic-ai/sdk"); // Ensure SDK is installed
const { app } = require("electron");
dotenv.config({
    path: path.join(app.getAppPath(), isDev() ? ".env" : "../dist-electron/.env")
});
const API_KEYS = process.env.CLAUDE ? process.env.CLAUDE.split(",") : [];
// ✅ Global index to track the last used API key
// ✅ Function to get the next API key in a round-robin fashion
function getNextApiKey() {
    if (API_KEYS.length === 0) {
        return null;
    }
    const randomIndex = Math.floor(Math.random() * API_KEYS.length); // Get a random index
    return API_KEYS[randomIndex]; // Return a random API key
}
const thisApi = getNextApiKey();
const anthropic = new Anthropic({
    apiKey: String(thisApi) // API key from environment variable
});
async function Claude(prompt) {
    prompt == null ? "" : "answer the question in this prompt, give complete answer as i can ask only once" + prompt;
    const content = [
        { type: "text", text: String(prompt) }
    ];
    try {
        const msg = await anthropic.messages.create({
            model: "claude-3-7-sonnet-20250219",
            max_tokens: 2500,
            messages: [{ role: "user", content }],
        });
        return msg.content[0].text;
    }
    catch (error) {
        console.error("❌ Error fetching response:", error);
        return null;
    }
}
