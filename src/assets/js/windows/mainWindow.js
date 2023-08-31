/**
 * @author Luuxis
 * @license CC-BY-NC 4.0 - https://creativecommons.org/licenses/by-nc/4.0/
 */

"use strict";
const { app , BrowserWindow ,Menu, ipcMain} = require('electron')
const path = require("path");
const os = require("os");
const fs = require('fs');


const pkg = require("../../../../package.json");
let mainWindow = undefined;

function getWindow() {
    return mainWindow;
}

function destroyWindow() {
    if (!mainWindow) return;
    mainWindow.close();
    mainWindow = undefined;
}
const appPath = app.getAppPath();

function createWindow() {
    destroyWindow();
    mainWindow = new BrowserWindow({
        title: pkg.preductname,
        width: 1600,
        height: 997,
        minWidth: 980,
        minHeight: 552,
        resizable: true,
        icon: `./src/assets/images/icon.${os.platform() === "win32" ? "ico" : "png"}`,
        transparent: os.platform() === 'win32',
        frame: os.platform() !== 'win32',
        show: false,
        webPreferences: {
            contextIsolation: false,
            nodeIntegration: true
        },
    });

    mainWindow.webContents.on("did-finish-load",()=>{
        const lang = readJSONFile("lang")
        const en = readJSONFile("en")
        const es = readJSONFile("es")
        const fr = readJSONFile("fr")

    })
    Menu.setApplicationMenu(null);
    mainWindow.setMenuBarVisibility(false);
    mainWindow.loadFile(path.join(app.getAppPath(), 'src', 'launcher.html'));
    mainWindow.once('ready-to-show', () => {
        if (mainWindow) {
            mainWindow.show();
        }
    });
}


ipcMain.on("change_lang", (e, code) => {
  const data = {
    code: code
  }
  writeJSONFile(data, "lang")
  mainWindow.webContents.send("update_lang")
})




function writeJSONFile(data, filePath) {
  try {

    const jsonData = JSON.stringify(data, null, 2);
    // fs.copyFileSync(file_path, path.join(app.getPath('userData'),  `${filePath}.json`));
    const extractedJsonPath = path.join(app.getPath('userData'), `${filePath}.json`);
    console.log(extractedJsonPath)
    fs.writeFileSync(extractedJsonPath, jsonData, 'utf8');
    console.log('JSON file has been written successfully.');
  } catch (error) {
    console.error('Error writing JSON file:', error);
  }
}


function readJSONFile(filePath) {
    const extractedJsonPath = path.join(app.getPath('userData'), `${filePath}.json`);
    const file_path = path.resolve(appPath, 'buket', `${filePath}.json`);
  
    if (!fs.existsSync(extractedJsonPath)) {
      try {
        const jsonData = fs.readFileSync(file_path, 'utf8');
  
        fs.writeFileSync(extractedJsonPath, jsonData, 'utf8');
        console.log(`File created at ${extractedJsonPath}`);
      } catch (error) {
        console.error('Error creating file:', error);
      }
    }
  
    try {
      const jsonData = fs.readFileSync(extractedJsonPath, 'utf8');
      return JSON.parse(jsonData);
    } catch (error) {
      console.error('Error reading JSON file:', error);
      return null;
    }
  }

module.exports = {
    getWindow,
    createWindow,
    destroyWindow,
};