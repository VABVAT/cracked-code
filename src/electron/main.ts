const { advCode } = require("./advCode.js")
const { getCode }  = require("./getcode.js");
const { app, BrowserWindow, ipcMain, globalShortcut, dialog  } = require("electron");
const path = require("path");
const { isDev } = require("./util.js");
const { getPreloadPath } = require("./pathResolver.js");
const { startTranscription } = require("./startListener.js");
const {exec} = require("child_process")
const {captureScreen} = require("./screen-capture/captureScreen.js")
const {machineIdSync} = require('node-machine-id')


var exists = false;
let keySequence = "";
app.on("ready" , () => {
    const mainWindow = new BrowserWindow({
        // width: 1920,
        fullscreen:true,
        alwaysOnTop: true, // Keeps window on top
        fullscreenable: true, // Prevents it from going fullscreen
        resizable: false, // Prevents accidental resizing
        skipTaskbar: true, // Keeps it in taskbar
        focusable: false,
        transparent: true,
        frame: false,
        hasShadow:false, // Allows user interaction
        webPreferences: {
            preload: getPreloadPath(),
            backgroundThrottling: false
        }
    })
    const registerKeys = ["Z"]; // Register necessary keys
    registerKeys.forEach((key) => {
      globalShortcut.register(key, () => {
        keySequence += key.toLowerCase(); // Store lowercase key presses
  
        if (keySequence.endsWith("zzz")) {
          mainWindow.webContents.send('send-screenshot')
          console.log("ZAZ sequence detected!");
          keySequence = ""; // Reset after detection
        }
  
        // Keep the sequence buffer small (max 3 characters)
        if (keySequence.length > 3) {
          keySequence = keySequence.slice(-3);
        }
      });
    });
    // mainWindow.setIgnoreMouseEvents(true, { forward: true });
    // function moveWindow(xOffset:any, yOffset:any) {
    //     if (!mainWindow) return;
    
    //     let {x, y} = mainWindow.getBounds();
    //     mainWindow.setBounds({ x: x + xOffset, y: y + yOffset, width: 800, height: 800 });
    // }
    
    if(isDev()){
        mainWindow.loadURL("http://localhost:3000")    
    }else{
        mainWindow.loadFile(path.join(app.getAppPath() , '/dist-react/index.html'))
    }
    mainWindow.setContentProtection(true)
    mainWindow.setAlwaysOnTop(true, "screen-saver");
    mainWindow.setIgnoreMouseEvents(true, { forward: true });
    mainWindow.webContents.on("did-finish-load", () => {
        mainWindow.webContents.send("enable-scroll");
      });
    mainWindow.on("close", (event:Event) => {
        const choice = dialog.showMessageBoxSync(mainWindow, {
            type: "question",
            buttons: ["Cancel", "Quit"],
            defaultId: 0,
            title: "Confirm Exit",
            message: "Are you sure you want to quit?",
        });

        if (choice === 0) {
            event.preventDefault(); // Stop closing if "Cancel" is clicked
        }
    });

    app.on("before-quit", (event:Event) => {
        if (!mainWindow || mainWindow.isDestroyed()) return;

        const choice = dialog.showMessageBoxSync(mainWindow, {
            type: "question",
            buttons: ["Cancel", "Quit"],
            defaultId: 0,
            title: "Confirm Exit",
            message: "Are you sure you want to quit?",
        });

        if (choice === 0) {
            event.preventDefault();
        }
    });



    exec('ffmpeg -version', (error:any) => {
        if (error) {
            exists = false
        } else {
            exists = true
        }
      });
    globalShortcut.register("Control+Shift+F", () => {
        if (mainWindow) {
            mainWindow.webContents.send("focus-input"); // Send event to renderer
        }
    });
    globalShortcut.register("Control+Shift+S", () => {
        if(mainWindow){
            mainWindow.webContents.send('start-server')
        }
    });
    globalShortcut.register("Control+Shift+I", () => {
        if(mainWindow){
            mainWindow.webContents.send('sai')
        }
    })

    globalShortcut.register("Control+Shift+R", () => {
        if(mainWindow){
            mainWindow.webContents.send('rr')
        }
    })

    globalShortcut.register("Control+Shift+Q", () => {
        if (mainWindow) {
            if (mainWindow.isVisible()) {
                mainWindow.hide(); // Hide instead of minimize
            } else {
                mainWindow.showInactive(); // Show without taking focus
            }
        }
    });
    globalShortcut.register("Ctrl+Down", () => {
        mainWindow.webContents.send("scroll-down");
      });
    
      globalShortcut.register("Ctrl+Up", () => {
        mainWindow.webContents.send("scroll-up");
      });

    globalShortcut.register("Control+Shift+M", () => {
        if (mainWindow) {
            mainWindow.minimize(); // Minimize the window
        }
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

    app.on("will-quit", () => {
        globalShortcut.unregisterAll();
        if (mainWindow) mainWindow.destroy();
    });

    
})