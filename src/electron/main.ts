import { sendImageToGPT4o } from "./multi-image-models/gpt4.js";
// import { generateCode } from "./advCode";
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
const {Claude} = require('./Claude.js')
const {advClaude} = require('./claudeAdv.js')
const {sendToDeepSeek} = require('./multi-image-models/deepseekMulti.js')
var exists = false;

export let imageCache:string[] = [];

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
    
    // mainWindow.on('ready-to-show', () => {
    //     const hwnd = mainWindow.getNativeWindowHandle();
    //     user32.SetWindowDisplayAffinity(hwnd, 1); // Prevents screen capture
    // });
    
    if(isDev()){
        mainWindow.loadURL("http://localhost:3000")    
    }else{
        mainWindow.loadFile(path.join(app.getAppPath() , '/dist-react/index.html'))
    }
    mainWindow.setContentProtection(true)
    // mainWindow.setOpacity(0); // Fully hidden
    mainWindow.webContents.on("devtools-opened", () => {
        mainWindow.webContents.closeDevTools();
    });
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
    globalShortcut.register('Control+Shift+M', () => {
        if(mainWindow){
            mainWindow.webContents.send('mode-switch');
        }
    })
    globalShortcut.register("Control+Shift+C", () => {
        if (mainWindow) {
            mainWindow.webContents.send("cycle");
        }
    });
    globalShortcut.register('Control+Shift+Z', () => {
       if(mainWindow) mainWindow.webContents.send('send-screenshot')
    })
    globalShortcut.register('Control+Shift+F', () => {
        if(mainWindow) mainWindow.webContents.send('send-screenshot-claude')
     })
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
    globalShortcut.register("Control+Shift+A", () => {
        if(mainWindow){
            mainWindow.webContents.send('scai')
        }
    })
    // image storing logic -----------------------
    globalShortcut.register("Control+Shift+V", async () => {
        await sendToDeepSeek(null, imageCache);
        if (Array.isArray(imageCache)) {
            imageCache.length = 0; // Clears the array without losing reference
        } else {
            console.error("imageCache is not an array, cannot clear it.");
        }
    });
    
    globalShortcut.register("Control+Shift+X", async () => {
        const screenShot = await captureScreen();
        if (!Array.isArray(imageCache)) {
            console.error("Error: imageCache is not an array");
            return;
        }
        imageCache.push(String(screenShot));
        // console.log("image there", imageCache);
    });
    
    // image storing logic -----------------------
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

    ipcMain.on('ffmpeg', (_:Event) => {
        //@ts-ignore
        _.sender.send('ff-status', exists)
    })


    ipcMain.on('send-advanced-request', async (eve:Event, prompt:string) => {
        const screenShot = await captureScreen();
        advCode(mainWindow, eve, prompt, screenShot)
    })

    ipcMain.handle('getClaudeAdvCode', async (_:Event, prompt:string) => {
        // console.log(prompt)
        const screenShot = await captureScreen();
        const response = await advClaude(prompt, screenShot)
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


    ipcMain.handle('need-key', async () => {
        const id = machineIdSync();
        return id;
    })
    ipcMain.handle('getCode', async (_:Event, prompt:string) => {
        const response = await getCode(prompt)
        console.log(response)  
        return response;
    })

    ipcMain.handle('getClaudeCode', async (_:Event, prompt:string) => {
        const response = await Claude(prompt)
        console.log(response)  
        return response;
    })

    app.on("will-quit", () => {
        globalShortcut.unregisterAll();
        if (mainWindow) mainWindow.destroy();
    });
    
})