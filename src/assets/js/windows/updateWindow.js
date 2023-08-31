/**
 * @author Luuxis
 * @license CC-BY-NC 4.0 - https://creativecommons.org/licenses/by-nc/4.0/
 */

"use strict";
const { app , BrowserWindow ,Menu, ipcMain} = require('electron')
const path = require("path");
const os = require("os");
const fs = require('fs');

let updateWindow = undefined;
const appPath = app.getAppPath();

function getWindow() {
    return updateWindow;
}

function destroyWindow() {
    if (!updateWindow) return;
    updateWindow.close();
    updateWindow = undefined;
}

function createWindow() {
    destroyWindow();
    updateWindow = new BrowserWindow({
        title: "Mise à jour",
        width: 400,
        height: 300,
        resizable: false,
        icon: `./src/assets/images/icon.${os.platform() === "win32" ? "ico" : "png"}`,
        transparent: os.platform() === 'win32',
        frame: false,
        show: false,
        webPreferences: {
            contextIsolation: false,
            nodeIntegration: true
        },
    });
    Menu.setApplicationMenu(null);
    updateWindow.setMenuBarVisibility(false);
    updateWindow.loadFile(path.join(app.getAppPath(), 'src', 'index.html'));
    
    updateWindow.webContents.on("did-finish-load",()=>{
        const lang = readJSONFile("lang")
        const en = readJSONFile("en")
        const es = readJSONFile("es")
        const fr = readJSONFile("fr")

    })

    updateWindow.once('ready-to-show', () => {
        if (updateWindow) {
            updateWindow.show();
        }
    });
}

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