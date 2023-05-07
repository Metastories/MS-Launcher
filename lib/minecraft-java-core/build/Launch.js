"use strict";
/**
 * @author Luuxis
 * @license CC-BY-NC 4.0 - https://creativecommons.org/licenses/by-nc/4.0/
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const child_process_1 = require("child_process");
const Minecraft_Json_js_1 = __importDefault(require("./Minecraft/Minecraft-Json.js"));
const Minecraft_Libraries_js_1 = __importDefault(require("./Minecraft/Minecraft-Libraries.js"));
const Minecraft_Assets_js_1 = __importDefault(require("./Minecraft/Minecraft-Assets.js"));
const Minecraft_Loader_js_1 = __importDefault(require("./Minecraft/Minecraft-Loader.js"));
const Minecraft_Java_js_1 = __importDefault(require("./Minecraft/Minecraft-Java.js"));
const Minecraft_Bundle_js_1 = __importDefault(require("./Minecraft/Minecraft-Bundle.js"));
const Minecraft_Arguments_js_1 = __importDefault(require("./Minecraft/Minecraft-Arguments.js"));
const Index_js_1 = require("./utils/Index.js");
const Downloader_js_1 = __importDefault(require("./utils/Downloader.js"));
class Launch {
    constructor() {
        this.on = events_1.EventEmitter.prototype.on;
        this.emit = events_1.EventEmitter.prototype.emit;
    }
    async Launch(opt) {
        this.options = {
            url: opt?.url || null,
            authenticator: opt?.authenticator || null,
            timeout: opt?.timeout || 10000,
            path: path_1.default.resolve(opt?.path || '.Minecraft').replace(/\\/g, '/'),
            version: opt?.version || 'latest_release',
            instance: opt?.instance || null,
            detached: opt?.detached || false,
            downloadFileMultiple: opt?.downloadFileMultiple || 3,
            loader: {
                type: opt?.loader?.type || null,
                build: opt?.loader?.build || 'latest',
                enable: opt?.loader?.enable || false,
            },
            verify: opt?.verify || false,
            ignored: opt?.ignored || [],
            JVM_ARGS: opt?.JVM_ARGS || [],
            GLOBAL_ARGS: opt?.GLOBAL_ARGS || [],
            javaPath: opt?.javaPath || null,
            screen: {
                width: opt?.screen?.width || null,
                height: opt?.screen?.height || null,
                fullscreen: opt?.screen?.fullscreen || false,
            },
            memory: {
                min: opt?.memory?.min || '1G',
                max: opt?.memory?.max || '2G'
            }
        };
        if (!this.options.loader.enable)
            this.options.loader = false;
        this.start();
    }
    async start() {
        let data = await this.DownloadGame();
        if (data.error)
            return this.emit('error', data);
        let { minecraftJson, minecraftLoader, minecraftVersion, minecraftJava } = data;
        let minecraftArguments = await new Minecraft_Arguments_js_1.default(this.options).GetArguments(minecraftJson, minecraftLoader);
        if (minecraftArguments.error)
            return this.emit('error', minecraftArguments);
        let loaderArguments = await new Minecraft_Loader_js_1.default(this.options).GetArguments(minecraftLoader, minecraftVersion);
        if (loaderArguments.error)
            return this.emit('error', loaderArguments);
        let Arguments = [
            ...minecraftArguments.jvm,
            ...loaderArguments.jvm,
            ...minecraftArguments.classpath,
            ...loaderArguments.game,
            ...minecraftArguments.game
        ];
        let java = this.options.javaPath ? this.options.javaPath : minecraftJava.path;
        let logs = this.options.instance ? `${this.options.path}/instances/${this.options.instance}` : this.options.path;
        if (!fs_1.default.existsSync(logs))
            fs_1.default.mkdirSync(logs, { recursive: true });
        let minecraftDebug = (0, child_process_1.spawn)(java, Arguments, { cwd: logs, detached: this.options.detached });
        this.emit('data', `Launching with arguments ${Arguments.join(' ')}`);
        minecraftDebug.stdout.on('data', (data) => this.emit('data', data.toString('utf-8')));
        minecraftDebug.stderr.on('data', (data) => this.emit('data', data.toString('utf-8')));
        minecraftDebug.on('close', (code) => this.emit('close', 'Minecraft closed'));
    }
    async DownloadGame() {
        let InfoVersion = await new Minecraft_Json_js_1.default(this.options).GetInfoVersion();
        let loaderJson = null;
        if (InfoVersion.error)
            return InfoVersion;
        let { json, version } = InfoVersion;
        let libraries = new Minecraft_Libraries_js_1.default(this.options);
        let gameLibraries = await libraries.Getlibraries(json);
        let gameAssetsOther = await libraries.GetAssetsOthers(this.options.url);
        let gameAssets = await new Minecraft_Assets_js_1.default(this.options).GetAssets(json);
        let gameJava = this.options.javaPath ? { files: [] } : await new Minecraft_Java_js_1.default(this.options).GetJsonJava(json);
        let bundle = [...gameLibraries, ...gameAssetsOther, ...gameAssets, ...gameJava.files];
        let filesList = await new Minecraft_Bundle_js_1.default(this.options).checkBundle(bundle);
        if (filesList.length > 0) {
            let downloader = new Downloader_js_1.default();
            let totsize = await new Minecraft_Bundle_js_1.default(this.options).getTotalSize(filesList);
            downloader.on("progress", (DL, totDL, element) => {
                this.emit("progress", DL, totDL, element);
            });
            downloader.on("speed", (speed) => {
                this.emit("speed", speed);
            });
            downloader.on("estimated", (time) => {
                this.emit("estimated", time);
            });
            downloader.on("error", (e) => {
                this.emit("error", e);
            });
            await downloader.downloadFileMultiple(filesList, totsize, this.options.downloadFileMultiple, this.options.timeout);
        }
        if (this.options.loader) {
            let loaderInstall = new Minecraft_Loader_js_1.default(this.options);
            loaderInstall.on('extract', (extract) => {
                this.emit('extract', extract);
            });
            loaderInstall.on('progress', (progress, size, element) => {
                this.emit('progress', progress, size, element);
            });
            loaderInstall.on('check', (progress, size, element) => {
                this.emit('check', progress, size, element);
            });
            loaderInstall.on('patch', (patch) => {
                this.emit('patch', patch);
            });
            let jsonLoader = await loaderInstall.GetLoader(version, this.options.javaPath ? this.options.javaPath : gameJava.path)
                .then((data) => data)
                .catch((err) => err);
            if (jsonLoader.error)
                return jsonLoader;
            loaderJson = jsonLoader;
        }
        if (this.options.verify)
            await libraries.checkFiles(bundle);
        let natives = await libraries.natives(bundle);
        if (natives.length === 0)
            json.nativesList = false;
        else
            json.nativesList = true;
        if ((0, Index_js_1.isold)(json))
            new Minecraft_Assets_js_1.default(this.options).copyAssets(json);
        return {
            minecraftJson: json,
            minecraftLoader: loaderJson,
            minecraftVersion: version,
            minecraftJava: gameJava
        };
    }
}
exports.default = Launch;
