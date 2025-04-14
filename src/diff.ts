import * as fs from 'fs';
import * as path from 'path';
import * as util from 'util';

import { awaiter } from './awaiter';
import { logDebug } from './extension';

const readdir = util.promisify(fs.readdir);
const lstat = util.promisify(fs.lstat);

function _walk(dir: string, result: WalkedResult[]) {
    return awaiter(function* () {
        let files: string[] = yield readdir(dir);
        yield Promise.all(files.map((file) => awaiter(function* () {
            let fullPath = path.join(dir, file);
            let stats = yield lstat(fullPath);
            logDebug('walk: ', fullPath);
            if (stats.isDirectory()) {
                yield _walk(fullPath, result);
            } else {
                result.push({
                    path: fullPath,
                    stats: stats,
                });
            }
        }.bind(this))));
    }.bind(this));
}

export function walk(dir: string): Promise<WalkedResult[]> {
    return awaiter(function* () {
        let result: WalkedResult[] = [];
        yield _walk(dir, result);
        return result;
    }.bind(this));
}

interface WalkedResult {
    path: string,
    stats: fs.Stats
}

export class FileObserver {
    private readonly dir: string;
    private readonly filter: FileFilter;
    private files: Map<string, number>;

    constructor(dirPath: string, filter: FileFilter = null) {
        this.files = new Map<string, number>();
        this.dir = dirPath;
        this.filter = filter;
    }

    walk(): Promise<any> {
        return awaiter(function* () {
            const files: WalkedResult[] = yield walk(this.dir);
            logDebug('walk: ', files);
            const modifiedFiles: string[] = [];
            const oldFiles: Map<string, number> = this.files;
            this.files = new Map();
            files.filter((file: WalkedResult) => {
                const relativePath: string = path.relative(this.dir, file.path);
                const stat = file.stats;
                if (this.filter && !this.filter(relativePath, file.path, file.stats)) {
                    return;
                }
                const timestamp = stat.mtime.getTime();
                if (oldFiles.has(file.path) && oldFiles.get(file.path) == timestamp) {
                    oldFiles.delete(file.path);
                    return;
                }
                oldFiles.delete(file.path);
                this.files.set(file.path, timestamp);
                modifiedFiles.push(relativePath);
            });
            const deletedFiles = [];
            oldFiles.forEach((timestamp, filePath) => {
                const relativePath = path.relative(this.dir, filePath);
                deletedFiles.push(relativePath);
            });
            return {
                modified: modifiedFiles,
                deleted: deletedFiles,
            };
        }.bind(this));
    }
}

export type FileFilter = (relativePath: string, path: string, stats: fs.Stats) => boolean;