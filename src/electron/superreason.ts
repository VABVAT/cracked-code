
const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
const { app} = require("electron");
const path = require("path");
const { isDev } = require("./util.js");
dotenv.config({path: path.join(app.getAppPath(), isDev() ? '.env' : '../dist-electron/.env', )})
const API_KEY = process.env.GEMINI_API_KEY
const axios = require("axios");
const API_URL = process.env.GPT_KEY
const BASE = 'https://api.openai.com/v1/chat/completions';
const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.GPT_KEY
});



async function generateCode(mainWindow:any, prompt: string){
    const defaultPrompt = process.env.DEEPSEEK_DEFAULT;
    prompt = (prompt == null || prompt.trim() == '') ? "" : prompt;
  try {
        console.log("Prompt:", prompt);
          const response = await openai.chat.completions.create(
              {
                  model: 'o3-mini', // Specify the R1 model
                  messages: [
                      { role: 'user', content:  String(defaultPrompt) + " " + prompt}
                  ],
                  store:true,
              },
          );
        // let buffer = ""
        //   mainWindow.webContents.send("superresponse", response.choices[0].message.content);
        // const formattedContent = formatCodeBlocks(response.choices[0].message.content);
        const respo = response.choices[0].message.content
        const rrr = await openai.chat.completions.create(
            {
                model: 'gpt-4o', // Specify the R1 model
                messages: [
                    { role: 'user', content:  "seperate the code part and other part in this response, wrap C++ code in ``` for easy formatting, DO NOT MODIFY THE LOGIC" + " \n" + respo}
                ],
                store:true
            },
        );
        mainWindow.webContents.send("superresponse", rrr.choices[0].message.content);
        console.log("Response:", rrr.choices[0].message.content);
        //   console.log(response.choices[0].message.content);
        
        //   let buffer = ""; // Store accumulated data

        //   response.data.on("data", (chunk: Buffer) => {
        //       try {
        //           buffer += chunk.toString(); // Append the new chunk
          
        //           // Split multiple events if received
        //           const jsonMessages = buffer.split("\n").filter((line) => line.startsWith("data: "));
          
        //           for (const message of jsonMessages) {
        //               const jsonStr = message.replace("data: ", "").trim();
        //               if (!jsonStr || jsonStr === "[DONE]") continue;
          
        //               const chunkJSON = JSON.parse(jsonStr);
        //                 // console.log(chunkJSON.choices?.[0]?.delta)
        //               const content = chunkJSON.choices?.[0]?.delta?.reasoning_content 
        //                   ?? chunkJSON.choices?.[0]?.delta?.content 
        //                   ?? "";
        //               console.log(content)
        //               mainWindow.webContents.send("stream-response", content);
        //           }
          
        //           buffer = ""; // Reset after processing
        //       } catch (error) {
        //           console.error("Error processing stream chunk:", error);
        //       }
        //   });
          
        // response.data.on("end", () => {
        //     console.log("Streaming ended");
        //     mainWindow.webContents.send("stream-end"); // ✅ Notify renderer when done
        // });

        // response.data.on("error", (err: any) => {
        //     console.error("Streaming error:", err);
        //     event.sender.send("stream-error", err.message);
        // });   
        } catch (error:any) {
            // console.error("Error calling DeepSeek API:", error.response ? error.response.data : error.message);
            // event.sender.send("stream-error", "Error in API call")
    }  
}


const genAI = new GoogleGenerativeAI(API_KEY?.toString());
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });


export async function superReason(mainWindow:any, imageCache: string[]) {
    try {

        const prompt = "Extract and explain the questions from these images so they can be fed to another AI.";
        // console.log(prompt)
        const imageParts = imageCache.map((base64) => ({
            inlineData: {
                data: base64,
                mimeType: "image/png", // Adjust if needed
            },
        }));
        const result = await model.generateContent([prompt, ...imageParts]);
        const rr =  result.response.text();
        console.log(rr);
        generateCode(mainWindow, rr)
    }catch (error) {
        console.error("Error in advCode:", error);
    }
}