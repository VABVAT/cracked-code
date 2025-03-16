/**
 * ✅ Accepts a text prompt + multiple images (Base64).
 * @param {string | null} prompt - The text prompt (default prompt if null).
 * @param {string[]} imageCache - Array of Base64-encoded image data.
 * @param {string} [mimeType="image/png"] - The image MIME type (default: PNG).
 * @returns {Promise<string>} - AI-generated response.
 */
export declare function advClaude(prompt: string | null, imageCache: string[], mimeType?: string): Promise<any>;
