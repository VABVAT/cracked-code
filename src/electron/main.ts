import { app, BrowserWindow } from "electron";
import path from 'path'
import { isDev } from "./util.js";
import { getPreloadPath } from "./pathResolver.js";
import { startTranscription } from "./startListener.js";

app.on("ready" , () => {
    const mainWindow = new BrowserWindow({
        width:800,
        height:800,
        alwaysOnTop:true,
        webPreferences:{
            preload: getPreloadPath()
        }
    })
    if(isDev()){
        mainWindow.loadURL("http://localhost:3000")    
    }else{
        mainWindow.loadFile(path.join(app.getAppPath() , '/dist-react/index.html'))
    }
    mainWindow.setContentProtection(true)
    startTranscription(mainWindow)
})