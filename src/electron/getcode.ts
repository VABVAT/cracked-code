const dotenv = require("dotenv");
const { app } = require("electron");
const path = require("path");
const axios = require("axios");
const { isDev } = require("./util.js");

dotenv.config({
    path: path.join(app.getAppPath(), isDev() ? ".env" : "../dist-electron/.env"),
});

const API_KEY = process.env.DEEPSEEK_API_KEY; // Change to DeepSeek API key
const API_URL = "https://api.deepseek.com/v1/chat/completions"; // Adjust URL if needed

export async function getCode(prompt:string) {
    
    try {
        const response = await axios.post(
            API_URL,
            {
                model: "deepseek-reasoner", // Use DeepSeek's model suited for coding
                messages: [{ role: "user", content: prompt + " treat this as interview question, whenever you code use c++ if DSA question is asked" }],
                temperature: 0.7,
            },
            {
                headers: {
                    "Authorization": `Bearer ${API_KEY}`,
                    "Content-Type": "application/json",
                },
            }
        );

        return response.data.choices[0].message.content;
    } catch (error: any) {
        console.error("DeepSeek API error:", error.response?.data || error.message);
        return "Error generating response";
    }
}
