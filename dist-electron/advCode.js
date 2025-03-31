"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.advCode = advCode;
const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
const { app } = require("electron");
const path = require("path");
const { isDev } = require("./util.js");
dotenv.config({ path: path.join(app.getAppPath(), isDev() ? '.env' : '../dist-electron/.env') });
const API_KEY = process.env.GEMINI_API_KEY;
const axios = require("axios");
const API_URL = process.env.DEEPSEEK_API_KEY;
const BASE = 'https://api.deepseek.com/chat/completions';
async function generateCode(mainWindow, prompt, event) {
    const defaultPrompt = process.env.DEEPSEEK_DEFAULT;
    prompt = (prompt == null || prompt.trim() == '') ? "" : prompt;
    try {
        console.log("Prompt:", prompt);
        const response = await axios.post(BASE, {
            model: 'deepseek-reasoner', // Specify the R1 model
            messages: [
                { role: 'system', content: 'You are a helpful assistant.' },
                { role: 'user', content: String(defaultPrompt) + " " + prompt }
            ],
            stream: true,
            temperature: 0
        }, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${API_URL}`
            },
            timeout: 600000,
            responseType: "stream"
        });
        let buffer = ""; // Store accumulated data
        response.data.on("data", (chunk) => {
            try {
                buffer += chunk.toString(); // Append the new chunk
                // Split multiple events if received
                const jsonMessages = buffer.split("\n").filter((line) => line.startsWith("data: "));
                for (const message of jsonMessages) {
                    const jsonStr = message.replace("data: ", "").trim();
                    if (!jsonStr || jsonStr === "[DONE]")
                        continue;
                    const chunkJSON = JSON.parse(jsonStr);
                    // console.log(chunkJSON.choices?.[0]?.delta)
                    const content = chunkJSON.choices?.[0]?.delta?.reasoning_content
                        ?? chunkJSON.choices?.[0]?.delta?.content
                        ?? "";
                    mainWindow.webContents.send("stream-response", content);
                }
                buffer = ""; // Reset after processing
            }
            catch (error) {
                console.error("Error processing stream chunk:", error);
            }
        });
        response.data.on("end", () => {
            console.log("Streaming ended");
            mainWindow.webContents.send("stream-end"); // ✅ Notify renderer when done
        });
        response.data.on("error", (err) => {
            console.error("Streaming error:", err);
            event.sender.send("stream-error", err.message);
        });
    }
    catch (error) {
        console.error("Error calling DeepSeek API:", error.response ? error.response.data : error.message);
        event.sender.send("stream-error", "Error in API call");
    }
}
const genAI = new GoogleGenerativeAI(API_KEY?.toString());
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
async function advCode(mainWindow, event, prompt, imageCache) {
    try {
        prompt = "Extract and explain the questions from these images so they can be fed to another AI.";
        // console.log(prompt)
        const imageParts = imageCache.map((base64) => ({
            inlineData: {
                data: base64,
                mimeType: "image/png", // Adjust if needed
            },
        }));
        const result = await model.generateContent([prompt, ...imageParts]);
        const rr = result.response.text();
        console.log(rr);
        generateCode(mainWindow, rr, event);
    }
    catch (error) {
        console.error("Error in advCode:", error);
    }
}
