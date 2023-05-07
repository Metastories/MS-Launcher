"use strict";
/**
 * @author Luuxis
 * @license CC-BY-NC 4.0 - https://creativecommons.org/licenses/by-nc/4.0/
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const net_1 = __importDefault(require("net"));
class status {
    constructor(ip = '0.0.0.0', port = 25565) {
        this.ip = ip;
        this.port = port;
    }
    getStatus() {
        return new Promise((resolve) => {
            let start = new Date();
            let client = net_1.default.connect(this.port, this.ip, () => {
                client.write(Buffer.from([0xFE, 0x01]));
            });
            client.setTimeout(5 * 1000);
            client.on('data', (data) => {
                if (data != null && data != '') {
                    let infos = data.toString().split("\x00\x00\x00");
                    let end = new Date();
                    resolve({
                        error: false,
                        ms: Math.round(end - start),
                        version: infos[2].replace(/\u0000/g, ''),
                        nameServer: infos[3].replace(/\u0000/g, ''),
                        playersConnect: infos[4].replace(/\u0000/g, ''),
                        playersMax: infos[5].replace(/\u0000/g, '')
                    });
                }
                client.end();
            });
            client.on('timeout', () => {
                resolve({ error: true });
                client.end();
            });
            client.on('err', (err) => {
                resolve({ error: true });
                console.error(err);
            });
        });
    }
}
exports.default = status;
