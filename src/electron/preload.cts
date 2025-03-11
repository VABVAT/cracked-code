const { ipcRenderer } = require("electron");
const electron = require("electron");


electron.contextBridge.exposeInMainWorld("electron",{
    // send text will take input from client-side, that input will be a callback function that returns nothing
    // we have defined the sendText here only
    // whenever send text recieves event sys-audio it calls the callback given to function in client side
    // client can only call these functions
    //! passing functions from front-end to back-end
    sendText: (callback: (data:string) => void) => ipcRenderer.on('sys-audio', (_:any, data:any) => callback(data)),
    transcription: (callback:(data: any) => void) => ipcRenderer.on('transcription-arrived', (_:any , data:any) => callback(data)),
    startServer: () => ipcRenderer.invoke('startServer'),
    airesponse: (prompt:string) => ipcRenderer.invoke('getCode', prompt),
    sendImageWithPrompt:(prompt:string) => ipcRenderer.invoke('getAdvCode', prompt),
    sendImageWithPromptC:(prompt: string) => ipcRenderer.invoke('getClaudeAdvCode', prompt),
    hardwareId:() => ipcRenderer.invoke('need-key'),
    ffmpegStatus: () => ipcRenderer.send('ffmpeg'),
    ffRecieve: (callback:(data:boolean) => void) => ipcRenderer.on('ff-status', (_:Event, data:boolean) => callback(data)),
    listenerFocus: (callback:() => void) => ipcRenderer.on("focus-input", (_:Event) => callback()),
    sendSS: (callback:() => void) => ipcRenderer.on('send-screenshot', (_:Event) => callback()),
    vc: (callback:() => void) => ipcRenderer.on('start-server', (_:Event) => callback() ),
    sendSSClaude: (callback:() => void) => ipcRenderer.on('send-screenshot-claude', (_:Event) => callback()),
    sai: (callback:() => void) => ipcRenderer.on('sai', (_:Event) => callback()),
    scai: (callback:() => void) => ipcRenderer.on('scai', (_:Event) => callback()),
    rr: (callback:() => void) => ipcRenderer.on('rr', (_:Event) => callback()),
    onScrollDown: (callback: () => void) => ipcRenderer.on("scroll-down", callback),
    onScrollUp: (callback: () => void) => ipcRenderer.on("scroll-up", callback),
    cycleResponse: (callback: () => void) => ipcRenderer.on("cycle", (_:Event) => callback()),
    mode: (callback: () => void) => ipcRenderer.on('mode-switch', (_:Event) => callback()),
    ClaudeResponse: (prompt:string) => ipcRenderer.invoke('getClaudeCode', prompt)
    // sendClaudeImageWithPrompt:(prompt:string) => ipcRenderer.invoke('getClaudeAdvCode', prompt)
})