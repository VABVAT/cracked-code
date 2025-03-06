const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
const { app} = require("electron");
const path = require("path");
const { isDev } = require("./util.js");
dotenv.config({path: path.join(app.getAppPath(), isDev() ? '.env' : '../dist-electron/.env', )})
const API_KEY = process.env.GEMINI_API_KEY
console.log(API_KEY)
const genAI = new GoogleGenerativeAI(API_KEY?.toString());
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
console.log(API_KEY)

export async function getCode(prompt:string) {
    const result = await model.generateContent(prompt);
    return result.response.text();  
}
// content();
