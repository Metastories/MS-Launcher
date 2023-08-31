/**
 * @author Luuxis
 * @license CC-BY-NC 4.0 - https://creativecommons.org/licenses/by-nc/4.0/
 */

import config from './utils/config.js';
import database from './utils/database.js';
import logger from './utils/logger.js';
import slider from './utils/slider.js';

export {
    config as config,
    database as database,
    logger as logger,
    changePanel as changePanel,
    addAccount as addAccount,
    slider as Slider,
    accountSelect as accountSelect
}

function changePanel(id) {
    let panel = document.querySelector(`.${id}`);
    let active = document.querySelector(`.active`)
    if (active) active.classList.toggle("active");
    panel.classList.add("active");
}

function addAccount(data) {
    let div = document.createElement("div");
    document.querySelector(".account-uuid").innerHTML =  data.uuid
    div.className = "account bg-[blue] rounded flex justify-between relative space-x-4 h-[45px] w-full items-center add_border px-[4px]"
    div.id = data.uuid;
    div.innerHTML = `
   
    <img class="absolute -left-[18px] -top-[11px] w-[70px] avatar-x rounded-[12px]" src="https://minotar.net/helm/${data.name}/100">
    <label class="text-center account-name !ml-[68px] text-[30px]"> ${data.name}</label>
 <img class="account-delete w-[38px] mt-[5px]" src="assets//img/log_out.png">
    `
    document.querySelector('.accounts').appendChild(div);
    document.querySelector(".account_name").innerHTML = data.name
    document.querySelector(".avatar").setAttribute("src",`https://minotar.net/helm/${data.name}/100`)

}

function accountSelect(uuid) {
    let account = document.getElementById(uuid);
    let pseudo = account.querySelector('.account-name').innerText;
    let activeAccount = document.querySelector('.active-account')

    if (activeAccount) activeAccount.classList.toggle('active-account');
    account.classList.add('active-account');
}
