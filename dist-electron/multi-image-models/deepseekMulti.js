"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendToDeepSeek = sendToDeepSeek;
// const axios = require("axios");
const path = require("path");
const dotenv = require("dotenv");
const { isDev } = require("../util.js");
const { app } = require("electron");
const { GoogleGenerativeAI } = require("@google/generative-ai");
dotenv.config({ path: path.join(app.getAppPath(), isDev() ? ".env" : "../dist-electron/.env") });
const API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY?.toString());
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
async function sendToDeepSeek(
// mainWindow: any,
// event: any,
prompt, imageCache // Array of Base64-encoded images
) {
    try {
        prompt = "Extract and explain the questions from these images so they can be fed to another AI.";
        console.log(prompt);
        // Convert each image into the required format
        const imageParts = imageCache.map((base64) => ({
            inlineData: {
                data: base64,
                mimeType: "image/png", // Adjust if needed
            },
        }));
        // Send prompt along with multiple images
        const result = await model.generateContent([prompt, ...imageParts]);
        const rr = await result.response.text();
        console.log(rr);
        // generateCode(mainWindow, rr, event);
    }
    catch (error) {
        console.error("Error in advCode:", error);
    }
}
