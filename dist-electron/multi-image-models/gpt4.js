"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendImageToGPT4o = sendImageToGPT4o;
// const { imageCache } = require("../main.js");
const axios = require("axios");
const path = require("path");
const dotenv = require("dotenv");
const { isDev } = require("../util.js");
const { app } = require("electron");
dotenv.config({ path: path.join(app.getAppPath(), isDev() ? ".env" : "../dist-electron/.env") });
const API_KEY = process.env.GPT_KEY;
async function sendImageToGPT4o(imageCache, mainWindow) {
    if (!Array.isArray(imageCache) || imageCache.length === 0) {
        console.error("Error: imageCache is empty or not an array.");
        return;
    }
    //   console.log(`Sending ${imageCache.length} images to GPT-4o...`);
    try {
        // Convert all images in imageCache to OpenAI format
        const imageMessages = imageCache.map((base64Image) => ({
            type: "image_url",
            image_url: { url: `data:image/png;base64,${base64Image}` },
        }));
        // Construct API request with multiple images
        const response = await axios.post("https://api.openai.com/v1/chat/completions", {
            model: "gpt-4o",
            messages: [
                {
                    role: "user",
                    content: [
                        { type: "text", text: "solve the question, if it is coding question do in C++ and give intution else just give me the answer" },
                        ...imageMessages, // ✅ Dynamically add images
                    ],
                },
            ],
            max_tokens: 3000,
        }, {
            headers: {
                Authorization: `Bearer ${API_KEY}`,
                "Content-Type": "application/json",
            },
        });
        mainWindow.webContents.send("response-gpt-4o", response.data.choices[0].message.content);
        // console.log("GPT-4o Response:", response.data.choices[0].message.content);
    }
    catch (error) {
        console.error("Error:", error.response?.data || error.message);
    }
}
