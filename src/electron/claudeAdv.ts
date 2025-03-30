const dotenv = require("dotenv");
const path = require("path");
const { isDev } = require("./util.js");
const Anthropic = require("@anthropic-ai/sdk");
const { app } = require("electron");

dotenv.config({ 
  path: path.join(app.getAppPath(), isDev() ? ".env" : "../dist-electron/.env") 
});

// ✅ Load API keys as an array from the environment variable
const API_KEYS = process.env.CLAUDE ? process.env.CLAUDE.split(",") : [];

// ✅ Function to get a random working API key
function getNextApiKey() {
  if (API_KEYS.length === 0) {
    return null;
  }
  const randomIndex = Math.floor(Math.random() * API_KEYS.length);
  return API_KEYS[randomIndex];
}

/**
 * ✅ Accepts a text prompt + multiple images (Base64).
 * @param {string | null} prompt - The text prompt (default prompt if null).
 * @param {string[]} imageCache - Array of Base64-encoded image data.
 * @param {string} [mimeType="image/png"] - The image MIME type (default: PNG).
 * @returns {Promise<string>} - AI-generated response.
 */
export async function advClaude(prompt: string | null, imageCache: string[], mimeType = "image/png") {
  let apiKey = getNextApiKey();
  if (!apiKey) return null; // Stop if no API key is available
  const defaultprompt = process.env.IMAGE_DEFAULT_PROMPT;
  // Default prompt setup
  prompt = (prompt == null || prompt == '') 
    ? String(defaultprompt)
    : `This is a conversation from a live interview, and you are my helper: ${prompt}. Provide a complete answer.If it is not a coding question then provide the answer else If it is a coding problem, write the solution in C++ along with intuition and explanation.`;
  const anthropic = new Anthropic({ apiKey });

  try {
    // ✅ Prepare image content array (supports multiple images)
    console.log("Prompt:", prompt);
    const content: Array<{ type: string; text?: string; source?: { type: string; media_type: string; data: string } }> = [{ type: "text", text: prompt }]; // Claude requires structured content
    if(imageCache.length === 0) {
      return "no images found";
    }
    // ✅ Append all images from imageCache[]
    imageCache.forEach(base64Image => {
      content.push({
        type: "image",
        source: {
          type: "base64",
          media_type: mimeType,
          data: base64Image,
        }
      });
    });

    // ✅ Send prompt + images to Claude
    const msg = await anthropic.messages.create({
      model: "claude-3-7-sonnet-20250219",
      max_tokens: 3500,
      messages: [{ role: "user", content }],
    });

    console.log("Claude's Response:", msg);
    const responseText = msg.content[0]?.text || "No response received";
    return responseText;
  } catch (error) {
    console.error(`❌ API key failed: ${apiKey}, skipping...`, error);
    return advClaude(prompt, imageCache, mimeType); // ✅ Retry with another API key
  }
}
