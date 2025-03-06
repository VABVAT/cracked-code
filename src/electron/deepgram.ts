const { createClient, LiveTranscriptionEvents } = require("@deepgram/sdk");
const { app} = require("electron");
const fetch = require("cross-fetch");
const path = require("path");
const dotenv = require("dotenv");
const { isDev } = require("./util.js");
// const { BrowserWindow } = require("electron");

 // Ensure environment variables are loaded
dotenv.config({path: path.join(app.getAppPath(), isDev() ? '.env' : '../dist-electron/.env', )})
// dotenv.config({path: isDev() ? app.getAppPath() : path.join(__dirname, '..', '/dist-electron/.env')})
// console.log(process.env)
// Your local audio stream
const url = "http://localhost:3001/audio"; 

export const live = async (mainWindow:any) => {
  const deepgram = createClient(process.env.DEEPGRAM_API_KEY);
  const connection = deepgram.listen.live({
    model: "nova-3",
    language: "en-US",
    smart_format: true,
  });

  connection.on(LiveTranscriptionEvents.Open, () => {
    console.log("Connected to Deepgram!");

    fetch(url)
      .then((r:any) => r.body)
      .then((res:any) => {
        res.on("readable", () => {
          connection.send(res.read());
        });
      })
      .catch(console.error);
  });

  connection.on(LiveTranscriptionEvents.Transcript, (data:any) => {
    // console.log("📝 Transcription:", data.channel.alternatives[0].transcript);
    mainWindow.webContents.send("transcription-arrived", {text: data.channel.alternatives[0].transcript})
  });

  connection.on(LiveTranscriptionEvents.Error, (err:any) => {
    console.error("⚠️ Deepgram Error:", err);
  });
};


