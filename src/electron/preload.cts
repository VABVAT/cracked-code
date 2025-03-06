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
    // returns promise to frontend
    startServer: () => ipcRenderer.invoke('startServer'),
    airesponse: (prompt:string) => ipcRenderer.invoke('getCode', prompt),
    sendImageWithPrompt:(prompt:string) => ipcRenderer.invoke('getAdvCode', prompt)
    // onFfmpegNotFound: (callback: (error: string) => void) => 
    //     ipcRenderer.on('ffmpeg-not-found', (_: any, data: any) => callback(data.error)),
    //   onFfmpegFound: (callback: () => void) => 
    //     ipcRenderer.on('ffmpeg-found', () => callback()),
        
    //   checkFfmpeg: () => ipcRenderer.send('check-ffmpeg'),
      
    //   removeAllListeners: () => {
    //     ipcRenderer.removeAllListeners('ffmpeg-not-found');
    //     ipcRenderer.removeAllListeners('ffmpeg-found');    
//}
})