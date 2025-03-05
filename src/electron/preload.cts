import { ipcRenderer } from "electron";
import electron from "electron";

electron.contextBridge.exposeInMainWorld("electron",{
    // send text will take input from client-side, that input will be a callback function that returns nothing
    // we have defined the sendText here only
    // whenever send text recieves event sys-audio it calls the callback given to function in client side
    // client can only call these functions
    sendText: (callback: (data:string) => void) => ipcRenderer.on('sys-audio', (_, data) => callback(data)),
    // returns promise to frontend
    startServer: () => ipcRenderer.invoke('startServer')
})