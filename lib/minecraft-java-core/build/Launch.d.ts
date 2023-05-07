/**
 * @author Luuxis
 * @license CC-BY-NC 4.0 - https://creativecommons.org/licenses/by-nc/4.0/
 */
export default class Launch {
    options: any;
    on: any;
    emit: any;
    constructor();
    Launch(opt: any): Promise<void>;
    start(): Promise<any>;
    DownloadGame(): Promise<any>;
}
