import { ipcRenderer } from "electron";

const electron = require("electron");

electron.contextBridge.exposeInMainWorld("electron",{
    sendText: (callback: (data:string) => void) => ipcRenderer.on('sys-audio', (_, data) => callback(data)) 
})