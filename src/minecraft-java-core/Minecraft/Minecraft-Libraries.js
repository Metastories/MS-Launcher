"use strict";
/**
 * @author Luuxis
 * @license CC-BY-NC 4.0 - https://creativecommons.org/licenses/by-nc/4.0/
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const os_1 = __importDefault(require("os"));
const fs_1 = __importDefault(require("fs"));
const adm_zip_1 = __importDefault(require("adm-zip"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const fs = require('fs');

let MojangLib = { win32: "windows", darwin: "osx", linux: "linux" };
let Arch = { x32: "32", x64: "64", arm: "32", arm64: "64" };
class Libraries {
    constructor(options) {
        this.options = options;
    }
    async Getlibraries(json) {
        this.json = json;
        let libraries = [];
        for (let lib of this.json.libraries) {
            let artifact;
            let type = "Libraries";
            if (lib.natives) {
                let classifiers = lib.downloads.classifiers;
                let native = lib.natives[MojangLib[process.platform]];
                if (!native)
                    native = lib.natives[process.platform];
                type = "Native";
                if (native)
                    artifact = classifiers[native.replace("${arch}", Arch[os_1.default.arch()])];
                else
                    continue;
            }
            else {
                if (lib.rules && lib.rules[0].os) {
                    if (lib.rules[0].os.name !== MojangLib[process.platform])
                        continue;
                }
                artifact = lib.downloads.artifact;
            }
            if (!artifact)
                continue;
            libraries.push({
                sha1: artifact.sha1,
                size: artifact.size,
                path: `libraries/${artifact.path}`,
                type: type,
                url: artifact.url
            });
        }
        let clientjar = this.json.downloads.client;
        libraries.push({
            sha1: clientjar.sha1,
            size: clientjar.size,
            path: `versions/${this.json.id}/${this.json.id}.jar`,
            type: "Libraries",
            url: clientjar.url
        });
        libraries.push({
            path: `versions/${this.json.id}/${this.json.id}.json`,
            type: "CFILE",
            content: JSON.stringify(this.json)
        });
        return libraries;
    }
    async GetAssetsOthers(url) {
        if (!url)
            return [];
        let data = await (0, node_fetch_1.default)(url).then(res => res.json());
        let assets = [];
        for (let asset of data) {
            if (!asset.path)
                continue;
            let path = asset.path;
            assets.push({
                sha1: asset.hash,
                size: asset.size,
                type: path.split("/")[0],
                path: this.options.instance ? `${this.options.path}/instances/${this.options.instance}/${path}` : path,
                url: asset.url
            });
        }
        return assets;
    }
    async natives(bundle) {
        let natives = bundle.filter(mod => mod.type === "Native").map(mod => `${mod.path}`);
        if (natives.length === 0)
            return natives;
        let nativeFolder = (`${this.options.path}/versions/${this.json.id}/natives`).replace(/\\/g, "/");
        if (!fs_1.default.existsSync(nativeFolder))
            fs_1.default.mkdirSync(nativeFolder, { recursive: true, mode: 0o777 });
        for (let native of natives) {
            let zip = new adm_zip_1.default(native);
            let entries = zip.getEntries();
            for (let entry of entries) {
                if (entry.entryName.startsWith("META-INF"))
                    continue;
                if (entry.isDirectory) {
                    fs_1.default.mkdirSync(`${nativeFolder}/${entry.entryName}`, { recursive: true, mode: 0o777 });
                    continue;
                }
                fs_1.default.writeFile(`${nativeFolder}/${entry.entryName}`, zip.readFile(entry), { encoding: "utf8", mode: 0o777 }, () => { });
            }
        }
        return natives;
    }
    async checkFiles(bundle) {
        let instancePath = '';
        let instanceFolder = [];
        if (this.options.instance) {
            if (!fs_1.default.existsSync(`${this.options.path}/instances`))
                fs_1.default.mkdirSync(`${this.options.path}/instances`, { recursive: true });
            instancePath = `/instances/${this.options.instance}`;
            instanceFolder = fs_1.default.readdirSync(`${this.options.path}/instances`).filter(dir => dir != this.options.instance);
        }
        let files = this.getFiles(this.options.path);
        let ignoredfiles = [...this.getFiles(`${this.options.path}/loader`)];
        for (let instances of instanceFolder) {
            ignoredfiles.push(...this.getFiles(`${this.options.path}/instances/${instances}`));
        }
        for (let file of this.options.ignored) {
            file = (`${this.options.path}${instancePath}/${file}`);
            if (fs_1.default.existsSync(file)) {
                if (fs_1.default.statSync(file).isDirectory()) {
                    ignoredfiles.push(...this.getFiles(file));
                }
                else if (fs_1.default.statSync(file).isFile()) {
                    ignoredfiles.push(file);
                }
            }
        }
        ignoredfiles.forEach(file => this.options.ignored.push((file)));
        bundle.forEach(file => ignoredfiles.push((file.path)));
        files = files.filter(file => ignoredfiles.indexOf(file) < 0);
        for (let file of files) {
            try {
                if (fs_1.default.statSync(file).isDirectory()) {
                    fs_1.default.rmdirSync(file);
                }
                else {
                    fs_1.default.unlinkSync(file);
                    let folder = file.split("/").slice(0, -1).join("/");
                    while (true) {
                        if (folder == this.options.path)
                            break;
                        let content = fs_1.default.readdirSync(folder);
                        if (content.length == 0)
                            fs_1.default.rmdirSync(folder);
                        folder = folder.split("/").slice(0, -1).join("/");
                    }
                }
            }
            catch (e) {
                continue;
            }
        }
    }
    isAlias(path) {
        const stats = fs.lstatSync(path);
        return stats.isSymbolicLink();
    }

    getFiles(path, file = []) {
        if (this.isAlias(path)) {
            return file;
        }
        if (fs.existsSync(path)) {
            let files = fs.readdirSync(path);
            if (files.length == 0) file.push(path);
            for (let i in files) {
                let name = `${path}/${files[i]}`;
                if (!this.isAlias(name) && fs.statSync(name).isDirectory()) this.getFiles(name, file);
                else file.push(name);
            }
        }
        return file;
    }
}
exports.default = Libraries;
