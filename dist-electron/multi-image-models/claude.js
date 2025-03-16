"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.advClaude = advClaude;
const dotenv = require("dotenv");
const path = require("path");
const { isDev } = require("../util.js");
const Anthropic = require("@anthropic-ai/sdk");
const { app } = require("electron");
dotenv.config({
    path: path.join(app.getAppPath(), isDev() ? ".env" : "../dist-electron/.env")
});
// ✅ Load API keys as an array from the environment variable
const API_KEYS = process.env.CLAUDE ? process.env.CLAUDE.split(",") : [];
// ✅ Track last used key
// ✅ Store failing keys
// ✅ Function to get the next working API key
function getNextApiKey() {
    if (API_KEYS.length === 0) {
        return null;
    }
    const randomIndex = Math.floor(Math.random() * API_KEYS.length); // Get a random index
    return API_KEYS[randomIndex]; // Return a random API key
}
/**
 * ✅ Accepts a text prompt + an image (Base64).
 * @param {string | null} prompt - The text prompt (default prompt if null).
 * @param {string} imageBase64 - The Base64-encoded image data.
 * @param {string} [mimeType="image/png"] - The image MIME type (default: PNG).
 * @returns {Promise<string>} - AI-generated response.
*/
async function advClaude(prompt, imageBase64, mimeType = "image/png") {
    let apiKey = getNextApiKey();
    if (!apiKey)
        return null; // Stop if no API key is available
    // console.log(prompt)
    prompt = (prompt == null || prompt == '') ? "give intution, intution , steps and answer in C++ give final solution that works" : ("following is a convo from a live interview and you are my helper " + prompt + "Give complete answer, write code for this problem if it is asked, otherwise just respond with answer,if asked write code in C++ , give intution and explanation as well");
    const anthropic = new Anthropic({ apiKey });
    try {
        // ✅ Prepare image content
        console.log("Prompt:", prompt);
        const content = [
            { type: "text", text: String(prompt) }, // 🛠 Claude needs this structure
            {
                type: "image",
                source: {
                    type: "base64",
                    media_type: mimeType,
                    data: imageBase64,
                }
            }
        ];
        // ✅ Send prompt + image to Claude
        const msg = await anthropic.messages.create({
            model: "claude-3-7-sonnet-20250219",
            max_tokens: 3500,
            messages: [{ role: "user", content }],
        });
        console.log(msg);
        const responseText = msg.content[0]?.text || "No response received";
        console.log("🔹 Claude's Response:", responseText);
        return responseText;
    }
    catch (error) {
        console.error(`❌ API key failed: ${apiKey}, skipping...`, error);
        return advClaude(prompt, imageBase64, mimeType); // ✅ Retry with the next available key
    }
}
