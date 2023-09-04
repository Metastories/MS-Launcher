const path = require('path');
const os = require('os');
const fs = require('fs');
const G = require('jquery');

function STDDECODE(appPath) {
    const current_lang_path =  path.join(appPath, `lang.json`);
    const current_lang = JSON.parse(fs.readFileSync(current_lang_path))
   
    const filePath = path.join(appPath, `${current_lang.code}.json`);
    const lang = JSON.parse(fs.readFileSync(filePath))[0]
    for (const key in lang) {
        G(`[dcode=${key}]`).html(lang[key])
    }
}

export default STDDECODE