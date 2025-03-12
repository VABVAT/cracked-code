import { response } from "express";

const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
const { app} = require("electron");
const path = require("path");
const { isDev } = require("./util.js");
dotenv.config({path: path.join(app.getAppPath(), isDev() ? '.env' : '../dist-electron/.env', )})
const API_KEY = process.env.GEMINI_API_KEY
const axios = require("axios");
const API_URL = process.env.DEEPSEEK_API_KEY
const BASE = 'https://api.deepseek.com/chat/completions';


async function generateCode(mainWindow:any, prompt: string, event:any){
  try {
        console.log("Prompt:", prompt);
          const response = await axios.post(
              BASE,
              {
                  model: 'deepseek-reasoner', // Specify the R1 model
                  messages: [
                      { role: 'system', content: 'You are a helpful assistant.' },
                      { role: 'user', content: "Code this in C++, Give most optimized solution and also explain the intution " + prompt }
                  ],
                  stream: true,
                  temperature: 0
              },
              {
                  headers: {
                      'Content-Type': 'application/json',
                      Authorization: `Bearer ${API_URL}`
                  },
                  timeout: 600000,
                  responseType: "stream"
              }
          );
          let buffer = ""; // Store accumulated data

          response.data.on("data", (chunk: Buffer) => {
              try {
                  buffer += chunk.toString(); // Append the new chunk
          
                  // Split multiple events if received
                  const jsonMessages = buffer.split("\n").filter((line) => line.startsWith("data: "));
          
                  for (const message of jsonMessages) {
                      const jsonStr = message.replace("data: ", "").trim();
                      if (!jsonStr || jsonStr === "[DONE]") continue;
          
                      const chunkJSON = JSON.parse(jsonStr);
                        // console.log(chunkJSON.choices?.[0]?.delta)
                      const content = chunkJSON.choices?.[0]?.delta?.reasoning_content 
                          ?? chunkJSON.choices?.[0]?.delta?.content 
                          ?? "";
          
                      mainWindow.webContents.send("stream-response", content);
                  }
          
                  buffer = ""; // Reset after processing
              } catch (error) {
                  console.error("Error processing stream chunk:", error);
              }
          });
          
        response.data.on("end", () => {
            console.log("Streaming ended");
            mainWindow.webContents.send("stream-end"); // ✅ Notify renderer when done
        });

        response.data.on("error", (err: any) => {
            console.error("Streaming error:", err);
            event.sender.send("stream-error", err.message);
        });   
        } catch (error:any) {
            console.error("Error calling DeepSeek API:", error.response ? error.response.data : error.message);
            event.sender.send("stream-error", "Error in API call")
    }  
}


const genAI = new GoogleGenerativeAI(API_KEY?.toString());
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });


export async function advCode(mainWindow:any, event:any ,prompt: string|null, imageBase64: string) {
    try {

        prompt = "extract question from this image so that it can be fed to another ai" ;
        console.log(prompt)
        const imagePart = {
            inlineData: {
                data: imageBase64,
                mimeType: "image/png", // Change if your image is a different format (e.g., "image/jpeg")
            }
        };
        const result = await model.generateContent([prompt, imagePart]);
        const rr =  result.response.text();
        console.log(rr);
        generateCode(mainWindow, rr, event)
    } catch (error) {
        console.error("Error in advCode:", error);
    }
}
