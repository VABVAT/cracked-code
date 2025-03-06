const path = require("path");
const { isDev } = require("./util.js");
const { app } = require("electron");


export function getPreloadPath(){
    return path.join(app.getAppPath(),
    isDev() ? '.' : '..', '/dist-electron/preload.cjs'
)
}