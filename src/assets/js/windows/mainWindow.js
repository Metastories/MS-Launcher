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
        width: 1280,
        height: 720,
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
        const lang = JSON.parse(`{
          "code": "fr"
        }`);
        const en = JSON.parse(`[
          {
              "Bienvenue": "Welcome",
              "Se_connecter": "Sign in with microsoft",
              "Pas_de_compte": "No minecraft account? ",
              "Obtenez_le": " Get it here",
              "Principium_autem1": "MyMetastories is a European film festival run by Unifrance and supported by the European Commission's Creative Europe programme.",
              "Principium_autem2": "The Minecraft server event developed by Rivrs is open from 18 to 21 October only.",
              "Principium_autem3": "Discover a selection of 20 films (7 features and 13 shorts) from 11 October to 3 November on mymetastories.eu!",
              "Principium_autem4": "Watch the 14 short films and one feature film programmed directly in Minecraft.",
              "JOUER": "PLAY",
              "Mes_paramètres ": "My settings",
              "Vous_possédez": "You have a total of ",
              "Vous_possédez_un": "You have a total of",
              "disponible": "available",
              "SAUVEGARDER": "TO SAFEGUARD",
              "Recherche_de": "Update search",
              "Chargement_en": "Loading...",
              "Connexion":"Connection",
              "verification": "Verification",
              "downloading": "Download",
              "starting": "Starting..."
          }
      ]`);
        const es = JSON.parse(`[
          {
              "Bienvenue": "Bienvenido",
              "Se_connecter": "iniciar sesión con microsoft",
              "Pas_de_compte": "¿Sin cuenta de Minecraft? ",
              "Obtenez_le": " Consiguelo aqui",
              "Principium_autem1": "MyMetastories es un festival de cine europeo dirigido por Unifrance y apoyado por el programa Europa Creativa de la Comisión Europea.",
              "Principium_autem2": "El evento Minecraft desarrollado por Rivrs estará abierto únicamente del 18 al 21 de octubre.",
              "Principium_autem3": "¡Descubra una selección de 7 largometrajes y 13 cortometrajes del 11 de octubre al 3 de noviembre en mymetastories.eu!",
              "Principium_autem4": "Vea los 14 cortometrajes y un largometraje programados directamente en Minecraft.",
              "JOUER": "JUGAR",
              "Mes_paramètres ": "Mi configuración",
              "Vous_possédez": "Tienes un total de",
              "Vous_possédez_un": "Tienes un total de",
              "disponible": "disponible",
              "SAUVEGARDER": "PARA SALVAGUARDAR",
              "Recherche_de": "Actualizar búsqueda",
              "Chargement_en": "Cargando...",
              "Connexion": "Conexión",
              "verification": "Auditoría en curso",
              "downloading": "Descargar",
              "starting": "Starting..."
          }
      ]`);
        const fr = JSON.parse(`[
          {
              "Bienvenue": "Bienvenue",
              "Se_connecter": "Se connecter avec microsoft",
              "Pas_de_compte": "Pas de compte minecraft ? ",
              "Obtenez_le": " Obtenez le ici",
              "Principium_autem1": "MyMetastories est un festival de films européens porté par Unifrance et soutenue par le programme Europe Créative de la Commission européenne.",
              "Principium_autem2": "Le serveur-événement sur Minecraft développé par Rivrs est ouvert du 18 au 21 octobre uniquement.",
              "Principium_autem3": "Découvrez une sélection de 20 films (7 longs et 13 courts métrages) du 11 octobre au 3 novembre sur mymetastories.eu !",
              "Principium_autem4": "Regardez les 14 courts métrages et un long métrage programmés directement dans Minecraft.",
              "JOUER": "JOUER",
              "Mes_paramètres ": "Mes paramètres",
              "Vous_possédez": "Vous possédez un total de",
              "Vous_possédez_un": "Vous possédez un total de",
              "disponible": "disponible",
              "SAUVEGARDER": "SAUVEGARDER",
              "Recherche_de": "Recherche de mise à jour",
              "Chargement_en": "Chargement en cours...",
              "Connexion":"Connexion",
              "verification": "Vérification",
              "downloading": "Téléchargement",
              "starting": "Démarrage en cours..."
          }
      ]`);

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


module.exports = {
    getWindow,
    createWindow,
    destroyWindow,
    app,
};