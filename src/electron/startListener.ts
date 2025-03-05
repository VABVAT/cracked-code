import { spawn } from "child_process";
import { BrowserWindow } from "electron";
import { app } from "electron";
import path from "path";
import { isDev } from "./util.js";

const scriptPath = !isDev()
  ? path.join(app.getAppPath(), '..', "/dist-electron/whisper_transcribe.py") // Production
  : path.join(app.getAppPath() ,"src/electron/whisper_transcribe.py"); // Development

export function startTranscription(mainWindow: BrowserWindow) {

    const pythonCmd = process.platform === "win32" ? "python" : "python3";
    const whisperProcess = spawn(pythonCmd, [scriptPath]);
    

    whisperProcess.stdout.on('data', (data) => {
        const text = data.toString().trim();
        mainWindow.webContents.send("sys-audio", {"text": text})
    });

    whisperProcess.stderr.on('data', (data) => {
        console.error(`Error: ${data}`);
    });

    whisperProcess.on('close', (code) => {
        console.log(`Whisper process exited with code ${code}`);
        // Restart on failure
        if (code !== 0) {
            console.log("Restarting Whisper process...");
            setTimeout(startTranscription, 2000);
        }
    });
}
