/**
 * @author Luuxis
 * @license CC-BY-NC 4.0 - https://creativecommons.org/licenses/by-nc/4.0/
 */
export default class java {
    options: any;
    constructor(options: any);
    GetJsonJava(jsonversion: any): Promise<void | {
        files: any;
        path: string;
    }>;
}
