const { advCode } = require("./advCode.js")
const { getCode }  = require("./getcode.js");
const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const { isDev } = require("./util.js");
const { getPreloadPath } = require("./pathResolver.js");
const { startTranscription } = require("./startListener.js");
const {exec} = require("child_process")
const {captureScreen} = require("./screen-capture/captureScreen.js")
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

    exec('ffmpeg -version', (error:any) => {
        if (error) {
          console.log(`FFmpeg is not installed`);
          // Send a message to the renderer process (React) with instructions to install FFmpeg
        //   mainWindow.webContents.send('ffmpeg-not-found', {error: "ffmpeg not found"});
        } else {
        // mainWindow.webContents.send("ffmpeg-found", {error: "found"})
          console.log(`FFmpeg is installed`);
        }
      });
    
    ipcMain.handle('getAdvCode', async (_:Event, prompt:string) => {
        const screenShot = await captureScreen();
        const response = await advCode(prompt, screenShot)
        return response
    })
    ipcMain.handle('startServer', async () => {
        // whatever is returned here goes to app.tsx 
    try{
        startTranscription(mainWindow)
        return "server started"
    }catch{
        return "error starting the server please see the documentation --docs"
    }
    })

    // ipcMain.on('transcription-arrived', (_, data:string) => {

    // })
    ipcMain.handle('getCode', async (_:Event, prompt:string) => {
        const response = await getCode(prompt)  
        return response;
    })
    
})