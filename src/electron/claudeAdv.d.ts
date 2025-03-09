/**
 * ✅ Accepts a text prompt + an image (Base64).
 * @param {string | null} prompt - The text prompt (default prompt if null).
 * @param {string} imageBase64 - The Base64-encoded image data.
 * @param {string} [mimeType="image/png"] - The image MIME type (default: PNG).
 * @returns {Promise<string>} - AI-generated response.
*/
export declare function advClaude(prompt: string | null, imageBase64: string, mimeType?: string): Promise<any>;
