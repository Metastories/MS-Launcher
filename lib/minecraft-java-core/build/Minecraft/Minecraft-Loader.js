"use strict";
/**
 * @author Luuxis
 * @license CC-BY-NC 4.0 - https://creativecommons.org/licenses/by-nc/4.0/
 */
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
const loaderDownloader = require('minecraft-loader');
class MinecraftLoader {
    constructor(options) {
        this.options = options;
        this.on = events_1.EventEmitter.prototype.on;
        this.emit = events_1.EventEmitter.prototype.emit;
    }
    async GetLoader(version, javaPath) {
        let loader = new loaderDownloader({
            path: `${this.options.path}/loader/${this.options.loader.type}`,
            timeout: this.options.timeout,
            downloadFileMultiple: this.options.downloadFileMultiple,
            autoClean: true,
            loader: {
                type: this.options.loader.type,
                version: version,
                build: this.options.loader.build,
                config: {
                    javaPath: javaPath,
                    minecraftJar: `${this.options.path}/versions/${version}/${version}.jar`,
                    minecraftJson: `${this.options.path}/versions/${version}/${version}.json`
                }
            }
        });
        return await new Promise((resolve, reject) => {
            loader.install();
            loader.on('json', (json) => {
                let loaderJson = json;
                loaderJson.libraries = loaderJson.libraries.map((lib) => {
                    lib.loader = `${this.options.path}/loader/${this.options.loader.type}`;
                    return lib;
                });
                resolve(loaderJson);
            });
            loader.on('extract', (extract) => {
                this.emit('extract', extract);
            });
            loader.on('progress', (progress, size, element) => {
                this.emit('progress', progress, size, element);
            });
            loader.on('check', (progress, size, element) => {
                this.emit('check', progress, size, element);
            });
            loader.on('patch', (patch) => {
                this.emit('patch', patch);
            });
            loader.on('error', (err) => {
                reject(err);
            });
        });
    }
    async GetArguments(json, version) {
        if (json === null) {
            return {
                game: [],
                jvm: []
            };
        }
        let moddeArguments = json.arguments;
        if (!moddeArguments)
            return { game: [], jvm: [] };
        let Arguments = {};
        if (moddeArguments.game)
            Arguments.game = moddeArguments.game;
        if (moddeArguments.jvm)
            Arguments.jvm = moddeArguments.jvm.map(jvm => {
                return jvm
                    .replace(/\${version_name}/g, version)
                    .replace(/\${library_directory}/g, `${this.options.path}/loader/${this.options.loader.type}/libraries`)
                    .replace(/\${classpath_separator}/g, process.platform === 'win32' ? ';' : ':');
            });
        return {
            game: Arguments.game || [],
            jvm: Arguments.jvm || [],
            mainClass: json.mainClass
        };
    }
}
exports.default = MinecraftLoader;
