"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startTranscription = startTranscription;
const { spawn } = require("child_process");
const express = require("express");
const { live } = require("./deepgram.js");
// const { BrowserWindow } = require("electron");
function startTranscription(mainWindow) {
    const app2 = express();
    const PORT = 3001;
    app2.get("/audio", (_, res) => {
        res.setHeader("Content-Type", "audio/wav");
        const ffmpeg = spawn("ffmpeg", [
            "-f", "dshow",
            "-i", "audio=Stereo Mix (Realtek(R) Audio)",
            "-ac", "1",
            "-ar", "16000",
            "-f", "wav",
            "-"
        ]);
        ffmpeg.stdout.pipe(res);
        ffmpeg.on("close", () => console.log("FFmpeg process closed"));
    });
    app2.listen(PORT, () => console.log(`Streaming at http://localhost:${PORT}/audio`));
    // fireUp the model
    live(mainWindow);
}
