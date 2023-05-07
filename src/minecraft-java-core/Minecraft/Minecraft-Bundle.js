"use strict";
/**
 * @author Luuxis
 * @license CC-BY-NC 4.0 - https://creativecommons.org/licenses/by-nc/4.0/
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const crypto_1 = __importDefault(require("crypto"));
class MinecraftBundle {
    constructor(options) {
        this.options = options;
    }
    async checkBundle(bundle) {
        let todownload = [];
        for (let file of bundle) {
            if (!file.path)
                continue;
            file.path = path_1.default.resolve(this.options.path, file.path).replace(/\\/g, "/");
            file.folder = file.path.split("/").slice(0, -1).join("/");
            if (file.type == "CFILE") {
                if (!fs_1.default.existsSync(file.folder))
                    fs_1.default.mkdirSync(file.folder, { recursive: true, mode: 0o777 });
                fs_1.default.writeFileSync(file.path, file.content, { encoding: "utf8", mode: 0o755 });
                continue;
            }
            if (fs_1.default.existsSync(file.path)) {
                if (this.options.ignored.find(ignored => ignored == file.path.split("/").slice(-1)[0]))
                    continue;
                if (file.sha1)
                    if (!(await this.checkSHA1(file.path, file.sha1)))
                        todownload.push(file);
            }
            else
                todownload.push(file);
        }
        return todownload;
    }
    async checkSHA1(file, sha1) {
        const hex = crypto_1.default.createHash('sha1').update(fs_1.default.readFileSync(file)).digest('hex');
        if (hex == sha1)
            return true;
        return false;
    }
    async getTotalSize(bundle) {
        let todownload = 0;
        for (let file of bundle) {
            todownload += file.size;
        }
        return todownload;
    }
}
exports.default = MinecraftBundle;
