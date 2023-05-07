"use strict";
/**
 * @author Luuxis
 * @license CC-BY-NC 4.0 - https://creativecommons.org/licenses/by-nc/4.0/
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.isold = exports.getPathLibraries = void 0;
function getPathLibraries(main, nativeString, forceExt) {
    let libSplit = main.split(':');
    let fileName = libSplit[3] ? `${libSplit[2]}-${libSplit[3]}` : libSplit[2];
    let finalFileName = fileName.includes('@') ? fileName.replace('@', '.') : `${fileName}${nativeString || ''}${forceExt || '.jar'}`;
    let pathLib = `${libSplit[0].replace(/\./g, '/')}/${libSplit[1]}/${libSplit[2].split('@')[0]}`;
    return {
        path: pathLib,
        name: `${libSplit[1]}-${finalFileName}`
    };
}
exports.getPathLibraries = getPathLibraries;
function isold(json) {
    return json.assets === 'legacy' || json.assets === 'pre-1.6';
}
exports.isold = isold;
