"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.live = void 0;
const { createClient, LiveTranscriptionEvents } = require("@deepgram/sdk");
const { app } = require("electron");
const fetch = require("cross-fetch");
const path = require("path");
const dotenv = require("dotenv");
const { isDev } = require("./util.js");
// const { BrowserWindow } = require("electron");
// Ensure environment variables are loaded
dotenv.config({ path: path.join(app.getAppPath(), isDev() ? '.env' : '../dist-electron/.env') });
// dotenv.config({path: isDev() ? app.getAppPath() : path.join(__dirname, '..', '/dist-electron/.env')})
// console.log(process.env)
// Your local audio stream
const url = "http://localhost:3001/audio";
const live = async (mainWindow) => {
    const deepgram = createClient(process.env.DEEPGRAM_API_KEY);
    const connection = deepgram.listen.live({
        model: "nova-3",
        language: "en-US",
        smart_format: true,
    });
    connection.on(LiveTranscriptionEvents.Open, () => {
        console.log("Connected to Deepgram!");
        fetch(url)
            .then((r) => r.body)
            .then((res) => {
            res.on("readable", () => {
                connection.send(res.read());
            });
        })
            .catch(console.error);
    });
    connection.on(LiveTranscriptionEvents.Transcript, (data) => {
        // console.log("📝 Transcription:", data.channel.alternatives[0].transcript);
        mainWindow.webContents.send("transcription-arrived", { text: data.channel.alternatives[0].transcript });
    });
    connection.on(LiveTranscriptionEvents.Error, (err) => {
        console.error("⚠️ Deepgram Error:", err);
        (0, exports.live)(mainWindow);
    });
};
exports.live = live;
