/**
 * @author Luuxis
 * @license CC-BY-NC 4.0 - https://creativecommons.org/licenses/by-nc/4.0/
 */

'use strict';

import funcs from '../std.render.js';

import { logger, database, changePanel } from '../utils.js';

const { Launch, Status } = require('./minecraft-java-core/Index');
const { shell, ipcRenderer } = require('electron');
const launch = new Launch();
const pkg = require('../package.json');
const G = require('jquery');

const dataDirectory = process.env.APPDATA || (process.platform == 'darwin' ? `${process.env.HOME}/Library/Application Support` : process.env.HOME)
const appPath = await ipcRenderer.invoke('get-user-data-path');

class Home {
    static id = "home";
    async init(config, news) {
        this.config = config
        this.news = await news
        this.database = await new database().init();
        this.initNews();
        this.initLaunch();
        this.initStatusServer();
        this.initBtn();
    }
    

    async initNews() {
        let news = document.querySelector('.news-list');
        if (this.news) {
            if (!this.news.length) {
                let blockNews = document.createElement('div');
                blockNews.classList.add('news-block', 'opacity-1');
                blockNews.innerHTML = `
                    <div class="news-header">
                        <div class="header-text">
                            <div class="title">Aucun news n'ai actuellement disponible.</div>
                        </div>
                    </div>
                    <div class="news-content">
                        <div class="bbWrapper">
                            <p>Vous pourrez suivre ici toutes les news relative au serveur.</p>
                        </div>
                    </div>`
                news.appendChild(blockNews);
            } else {
                for (let News of this.news) {
                    let date = await this.getdate(News.publish_date)
                    let blockNews = document.createElement('div');
                    blockNews.classList.add('news-block');
                    blockNews.innerHTML = `
                        <div class="news-header">
                            <div class="header-text">
                                <div class="title">${News.title}</div>
                            </div>
                            <div class="date">
                                <div class="day">${date.day}</div>
                                <div class="month">${date.month}</div>
                            </div>
                        </div>
                        <div class="news-content">
                            <div class="bbWrapper">
                                <p>${News.content.replace(/\n/g, '</br>')}</p>
                                <p class="news-author">Auteur,<span> ${News.author}</span></p>
                            </div>
                        </div>`
                    news.appendChild(blockNews);
                }
            }
        } else {
            let blockNews = document.createElement('div');
            blockNews.classList.add('news-block', 'opacity-1');
            blockNews.innerHTML = `
                <div class="news-header">
                    <div class="header-text">
                        <div class="title">Error.</div>
                    </div>
                </div>
                <div class="news-content">
                    <div class="bbWrapper">
                        <p>Impossible de contacter le serveur des news.</br>Merci de vérifier votre configuration.</p>
                    </div>
                </div>`
            // news.appendChild(blockNews);
        }
    }

    async initLaunch() {
        document.querySelector('.btm-left-wrp').addEventListener('click', async () => {
            let urlpkg = pkg.user ? `${pkg.url}/${pkg.user}` : pkg.url;
            let uuid = (await this.database.get('1234', 'accounts-selected')).value;
            let account = (await this.database.get(uuid.selected, 'accounts')).value;
            let ram = (await this.database.get('1234', 'ram')).value;
            let Resolution = (await this.database.get('1234', 'screen')).value;
            let launcherSettings = (await this.database.get('1234', 'launcher')).value;

            let playBtn = document.querySelector('.btm-left-wrp');
            let info = document.querySelector(".text-download")
            let progressBar = document.querySelector(".progress-bar")

            if (Resolution.screen.width == '<auto>') {
                screen = false
            } else {
                screen = {
                    width: Resolution.screen.width,
                    height: Resolution.screen.height
                }
            }

            let opts = {
                url: this.config.game_url === "" || this.config.game_url === undefined ? `${urlpkg}/files` : this.config.game_url,
                authenticator: account,
                timeout: 10000,
                path: `${dataDirectory}/${process.platform == 'darwin' ? this.config.dataDirectory : `.${this.config.dataDirectory}`}`,
                version: this.config.game_version,
                detached: launcherSettings.launcher.close === 'close-all' ? false : true,
                downloadFileMultiple: 30,

                loader: {
                    type: this.config.loader.type,
                    build: this.config.loader.build,
                    enable: this.config.loader.enable,
                },

                verify: this.config.verify,
                ignored: ['loader', ...this.config.ignored],

                java: true,

                memory: {
                    min: `${ram.ramMin * 1024}M`,
                    max: `${ram.ramMax * 1024}M`
                }
            }
            

            playBtn.style.display = "none"
            info.style.display = "block"
            launch.Launch(opts);

            launch.on('extract', extract => {
                console.log(extract);
                console.log(extract);
                console.log(extract);
            });



            launch.on('progress', (progress, size) => {

                const translations = funcs.retriveLangs(appPath);

                progressBar.style.display = "block";
                document.querySelector(".text-download").innerHTML = `${translations.downloading} ${((progress / size) * 100).toFixed(0)}%`;
                ipcRenderer.send('main-window-progress', { progress, size });
                progressBar.value = progress;
                progressBar.max = size;
            });

            launch.on('check', (progress, size) => {

                const translations = funcs.retriveLangs(appPath);

                progressBar.style.display = "block"
                document.querySelector(".text-download").innerHTML = `${translations.verification} ${((progress / size) * 100).toFixed(0)}%`
                progressBar.value = progress;
                progressBar.max = size;
            });

            launch.on('estimated', (time) => {
                let hours = Math.floor(time / 3600);
                let minutes = Math.floor((time - hours * 3600) / 60);
                let seconds = Math.floor(time - hours * 3600 - minutes * 60);
                console.log(`${hours}h ${minutes}m ${seconds}s`);
            })

            launch.on('speed', (speed) => {
                console.log(`${(speed / 1067008).toFixed(2)} Mb/s`)
            })
 
            launch.on('patch', patch => {
                console.log(patch);
                info.innerHTML = `Patch en cours...`
            });

            launch.on('data', (e) => {
                new logger('Minecraft', '#36b030');
                if (launcherSettings.launcher.close === 'close-launcher') ipcRenderer.send("main-window-hide");
                ipcRenderer.send('main-window-progress-reset')
                progressBar.style.display = "none"

                const translations = funcs.retriveLangs(appPath);

                info.innerHTML = `${translations.starting}`
                console.log(e);
            })

            launch.on('close', code => {
                if (launcherSettings.launcher.close === 'close-launcher') ipcRenderer.send("main-window-show");
                progressBar.style.display = "none"
                info.style.display = "none"
                playBtn.style.display = "block"

                const translations = funcs.retriveLangs(appPath);

                info.innerHTML = `${translations.verification}`
                new logger('Launcher', '#7289da');
                console.log('Close');
            });

            launch.on('error', err => {
                console.log(err);
            });
        })
    }

    async initStatusServer() {
        let nameServer = document.querySelector('.server-text .name');
        let serverMs = document.querySelector('.server-text .desc');
        let playersConnected = document.querySelector('.etat-text .text');
        let online = document.querySelector(".etat-text .online");
        let serverPing = await new Status(this.config.status.ip, this.config.status.port).getStatus();

        if (!serverPing.error) {
            playersConnected.textContent = serverPing.playersConnect + " joueurs connectés";
        } else if (serverPing.error) {
            playersConnected.textContent = 0 + " joueurs connectés";
        }
    }

    
    initBtn() {
        
        const G = require("jquery")
        funcs.STDDECODE(appPath)
        document.querySelector('.avterInfo').addEventListener('click', () => {
            const panel = document.querySelector(".panel.home");
            panel.style.setProperty("opacity", 1, "important");
            changePanel('settings');
        });
        document.querySelector(".close_settings").addEventListener("click",()=>{
          
            changePanel('home');
         
        })

        G("a[href^='http']").on('click', function(event) {
            event.preventDefault();
            shell.openExternal(this.href);
        });
     
        const minimize = document.getElementById("minimize")
        const close = document.getElementById("close")
        minimize.onclick = ()=>{
            ipcRenderer.send("main-window-minimize");
        }
        close.onclick = ()=>{
            ipcRenderer.send("main-window-close");
        }

        G("#lang_en").click(() => {
            ipcRenderer.send("change_lang", "en")
        })
        G("#lang_fr").click(() => {
            ipcRenderer.send("change_lang", "fr")
        })
        G("#lang_es").click(() => {
            ipcRenderer.send("change_lang", "es")
        })

        G("#lang_en_home").click(() => {
            ipcRenderer.send("change_lang", "en")
        })
        G("#lang_fr_home").click(() => {
            ipcRenderer.send("change_lang", "fr")
        })
        G("#lang_es_home").click(() => {
            ipcRenderer.send("change_lang", "es")
        })

        ipcRenderer.on("update_lang",()=>{
            funcs.STDDECODE(appPath)
        })

    }

    async getdate(e) {
        let date = new Date(e)
        let year = date.getFullYear()
        let month = date.getMonth() + 1
        let day = date.getDate()
        let allMonth = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre']
        return { year: year, month: allMonth[month - 1], day: day }
    }
}
export default Home;