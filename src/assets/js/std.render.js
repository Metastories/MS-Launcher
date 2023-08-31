const path = require('path');
const os = require('os');
const fs = require('fs');

function STDDECODE() {
    const G = require('jquery')
    const current_lang_path =  path.join(os.homedir(), 'AppData', 'Roaming', 'metastories-launcher', 'lang.json');
    const current_lang = JSON.parse(fs.readFileSync(current_lang_path))
   
    const filePath = path.join(os.homedir(), 'AppData', 'Roaming', 'metastories-launcher', `${current_lang.code}.json`);
    const lang = JSON.parse(fs.readFileSync(filePath))[0]
    for (const key in lang) {
        G(`[dcode=${key}]`).html(lang[key])
    }
    

}

export default STDDECODE