const { advCode } = require("./advCode.js")
const { getCode }  = require("./getcode.js");
const { app, BrowserWindow, ipcMain, globalShortcut } = require("electron");
const path = require("path");
const { isDev } = require("./util.js");
const { getPreloadPath } = require("./pathResolver.js");
const { startTranscription } = require("./startListener.js");
const {exec} = require("child_process")
const {captureScreen} = require("./screen-capture/captureScreen.js")
const {machineIdSync} = require('node-machine-id')

var exists = false;
app.on("ready" , () => {
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 800,
        alwaysOnTop: true, // Keeps window on top
        fullscreenable: false, // Prevents it from going fullscreen
        resizable: false, // Prevents accidental resizing
        skipTaskbar: true, // Keeps it in taskbar
        focusable: true,
        transparent: true, // Allows user interaction
        webPreferences: {
            preload: getPreloadPath()
        }
    })


    if(isDev()){
        mainWindow.loadURL("http://localhost:3000")    
    }else{
        mainWindow.loadFile(path.join(app.getAppPath() , '/dist-react/index.html'))
    }
    mainWindow.setContentProtection(true)
    mainWindow.setAlwaysOnTop(true, "screen-saver");

    exec('ffmpeg -version', (error:any) => {
        if (error) {
            exists = false
        } else {
            exists = true
        }
      });

      globalShortcut.register("Control+Shift+Q", () => {
        if (mainWindow) {
          if (mainWindow.isMinimized()) {
            mainWindow.restore();
          }
          mainWindow.show();
          mainWindow.focus();
          mainWindow.setAlwaysOnTop(true, 'screen-saver')
        }
      });
    
    globalShortcut.register("Control+Shift+M", () => {
        if (mainWindow) {
            mainWindow.minimize(); // Minimize the window
        }
    });
      
      app.on("will-quit", () => {
        globalShortcut.unregisterAll(); // Unregister shortcuts on quit
      });
    
      app.on("will-quit", () => {
        globalShortcut.unregisterAll(); // Unregister shortcuts
        if (mainWindow) mainWindow.destroy();
      });
    ipcMain.on('ffmpeg', (_:Event) => {
        //@ts-ignore
        _.sender.send('ff-status', exists)
    })

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
    ipcMain.handle('need-key', async () => {
        const id = machineIdSync();
        return id;
    })
    ipcMain.handle('getCode', async (_:Event, prompt:string) => {
        const response = await getCode(prompt)  
        return response;
    })
    
})