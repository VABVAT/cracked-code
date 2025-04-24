
const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
const { app} = require("electron");
const path = require("path");
const { isDev } = require("./util.js");
dotenv.config({path: path.join(app.getAppPath(), isDev() ? '.env' : '../dist-electron/.env', )})
const API_KEY = process.env.GEMINI_API_KEY
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
        } catch (error:any) {
            mainWindow.webContents.send("superresponse", "ERROR");
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