/**
 * @author Luuxis
 * @license CC-BY-NC 4.0 - https://creativecommons.org/licenses/by-nc/4.0/
 */
interface downloadOptions {
    url: string;
    path: string;
    length: number;
    folder: string;
}
export default class download {
    on: any;
    emit: any;
    constructor();
    downloadFileMultiple(files: downloadOptions, size: number, limit?: number, timeout?: number): Promise<unknown>;
}
export {};
