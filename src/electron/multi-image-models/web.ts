const axios = require("axios");
const path = require("path");
const dotenv = require("dotenv");
const { isDev } = require("../util.js");
const { app } = require("electron");


dotenv.config({ path: path.join(app.getAppPath(), isDev() ? ".env" : "../dist-electron/.env") });
const API_KEY = process.env.GPT_KEY;

export async function sendImageToGPT4oWeb(imageCache:string[], mainWindow:any) {
  if (!Array.isArray(imageCache) || imageCache.length === 0) {
    console.error("Error: imageCache is empty or not an array.");
    return;
  }

  try {
    // Convert all images in imageCache to OpenAI format
    const imageMessages = imageCache.map((base64Image) => ({
      type: "image_url",
      image_url: { url: `data:image/png;base64,${base64Image}` }
    }));
    const response2 = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-4o",
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: String("extract questions from this image so that it can be fed to another ai") },
                ...imageMessages, // ✅ Dynamically add images
              ],
            },
          ],
          max_tokens: 3000,
        },
        {
          headers: {
            Authorization: `Bearer ${API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );
        const prom =  response2.data.choices[0].message.content;
    // Construct API request with multiple images
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o-search-preview",
        web_search_options : {},
        messages: [
          {
            role: "user",
            content: String(prom)
          },
        ],
        max_tokens: 3000,
      },
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    mainWindow.webContents.send("response-gpt-4o-web", response.data.choices[0].message.content);  
  } catch (error: any) {
    mainWindow.webContents.send("response-gpt-4o-web", "error");
    console.error("Error:", error.response?.data || error.message);
  }
}

