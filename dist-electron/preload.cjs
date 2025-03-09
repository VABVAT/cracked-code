"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { ipcRenderer } = require("electron");
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("electron", {
    // send text will take input from client-side, that input will be a callback function that returns nothing
    // we have defined the sendText here only
    // whenever send text recieves event sys-audio it calls the callback given to function in client side
    // client can only call these functions
    //! passing functions from front-end to back-end
    sendText: (callback) => ipcRenderer.on('sys-audio', (_, data) => callback(data)),
    transcription: (callback) => ipcRenderer.on('transcription-arrived', (_, data) => callback(data)),
    // returns promise to frontend
    startServer: () => ipcRenderer.invoke('startServer'),
    airesponse: (prompt) => ipcRenderer.invoke('getCode', prompt),
    sendImageWithPrompt: (prompt) => ipcRenderer.invoke('getAdvCode', prompt),
    hardwareId: () => ipcRenderer.invoke('need-key'),
    ffmpegStatus: () => ipcRenderer.send('ffmpeg'),
    ffRecieve: (callback) => ipcRenderer.on('ff-status', (_, data) => callback(data)),
    listenerFocus: (callback) => ipcRenderer.on("focus-input", (_) => callback()),
    sendSS: (callback) => ipcRenderer.on('send-screenshot', (_) => callback()),
    vc: (callback) => ipcRenderer.on('start-server', (_) => callback()),
    sai: (callback) => ipcRenderer.on('sai', (_) => callback()),
    rr: (callback) => ipcRenderer.on('rr', (_) => callback()),
    onScrollDown: (callback) => ipcRenderer.on("scroll-down", callback),
    onScrollUp: (callback) => ipcRenderer.on("scroll-up", callback)
});
