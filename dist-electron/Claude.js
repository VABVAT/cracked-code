"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Claude = Claude;
const dotenv = require("dotenv");
const path = require("path");
const { isDev } = require("./util.js");
// const Anthropic = require("@anthropic-ai/sdk"); // Ensure SDK is installed
const { app } = require("electron");
const { OpenAI } = require("openai");
dotenv.config({
    path: path.join(app.getAppPath(), isDev() ? ".env" : "../dist-electron/.env")
});
// const API_KEYS = process.env.CLAUDE ? process.env.CLAUDE.split(",") : [];
// ✅ Global index to track the last used API key
// ✅ Function to get the next API key in a round-robin fashion
// function getNextApiKey() {
//   if (API_KEYS.length === 0) {
//     return null;
//   }
//   const randomIndex = Math.floor(Math.random() * API_KEYS.length); // Get a random index
//   return API_KEYS[randomIndex]; // Return a random API key
// }
const thisApi = process.env.GPT_KEY; // Get the API key from environment variable
const openai = new OpenAI({
    apiKey: String(thisApi), // API key from environment variable
});
async function Claude(prompt) {
    prompt = prompt ? `Answer the question in this prompt, give a complete answer as I can ask only once, if it is a coding question then code in C++, with inution and approach: ${prompt}` : "Ignore";
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o", // Use the desired OpenAI model
            max_tokens: 2500,
            messages: [{ role: "user", content: prompt }],
        });
        return response.choices[0].message.content;
    }
    catch (error) {
        console.error("❌ Error fetching response:", error);
        return null;
    }
}
