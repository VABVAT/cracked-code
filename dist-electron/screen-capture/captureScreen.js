"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.captureScreen = captureScreen;
const { screen, desktopCapturer } = require("electron");
// const fs = require("fs");
// const path = require("path");
// Function to capture the screen and return a hosted URL
async function captureScreen() {
    const primaryDisplay = screen.getPrimaryDisplay();
    const { width, height } = primaryDisplay.size;
    const options = {
        types: ["screen"],
        thumbnailSize: { width, height },
    };
    const sources = await desktopCapturer.getSources(options);
    const primarySource = sources.find(({ display_id }) => display_id == primaryDisplay.id);
    if (!primarySource) {
        throw new Error("No primary display source found.");
    }
    const imageBuffer = primarySource.thumbnail.toPNG();
    return imageBuffer.toString("base64");
}
