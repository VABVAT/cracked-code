"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Claude = Claude;
const dotenv = require("dotenv");
const path = require("path");
const { isDev } = require("./util.js");
const { app } = require("electron");
const { OpenAI } = require("openai");
dotenv.config({
    path: path.join(app.getAppPath(), isDev() ? ".env" : "../dist-electron/.env")
});
const thisApi = process.env.GPT_KEY; // Get the API key from environment variable
const openai = new OpenAI({
    apiKey: String(thisApi), // API key from environment variable
});
async function Claude(prompt) {
    prompt = prompt ? `Answer the question in this prompt, give a complete answer as I can ask only once, If it is a coding question then Answer in C++, else just give the general answer to this ${prompt}` : "Ignore";
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o", // Use the desired OpenAI model
            max_tokens: 3500,
            messages: [{ role: "user", content: prompt }],
        });
        return response.choices[0].message.content;
    }
    catch (error) {
        console.error("❌ Error fetching response:", error);
        return null;
    }
}
