"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPreloadPath = getPreloadPath;
const path = require("path");
const { isDev } = require("./util.js");
const { app } = require("electron");
function getPreloadPath() {
    return path.join(app.getAppPath(), isDev() ? '.' : '..', '/dist-electron/preload.cjs');
}
