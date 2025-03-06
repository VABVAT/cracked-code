const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
const { app} = require("electron");
const path = require("path");
const fs = require('fs')
const { isDev } = require("./util.js");
dotenv.config({path: path.join(app.getAppPath(), isDev() ? '.env' : '../dist-electron/.env', )})
const API_KEY = process.env.GEMINI_API_KEY

const genAI = new GoogleGenerativeAI(API_KEY?.toString());
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });


export async function advCode(prompt: string, imageBase64: string) {
    try {

        prompt = prompt.trim() == "" ? "if there is a question then do that otherwise help me however you can as this is my interview" : (prompt + "write code for this proble if it is asked otherwise just respond with answer not write code in C++");
        console.log(prompt)
        const imagePart = {
            inlineData: {
                data: imageBase64,
                mimeType: "image/png", // Change if your image is a different format (e.g., "image/jpeg")
            },
            description: "This image shows the problem related to algorithm X. Please provide detailed solutions based on it."
        };

        const result = await model.generateContent([prompt, imagePart]);
        return result.response.text();
    } catch (error) {
        console.error("Error in advCode:", error);
    }
}
