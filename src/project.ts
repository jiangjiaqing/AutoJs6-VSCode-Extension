import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import * as vscode from 'vscode';
import * as archiver from 'archiver';
import * as streamBuffers from 'stream-buffers';

import { Uri } from 'vscode';
import { FileObserver, FileFilter } from './diff';
import { awaiter } from './awaiter';
import { logDebug } from './extension';

export class ProjectTemplate {
    private readonly templateUri: Uri;
    private readonly outUri: Uri;

    constructor(templateUri: Uri, uri: Uri) {
        this.templateUri = templateUri;
        this.outUri = uri;
    }

    build() {
        return awaiter(function* () {
            const uri = this.outUri;
            yield this.copyDirIfNotExists(this.templateUri.fsPath, this.outUri.fsPath);
            return uri;
        }.bind(this));
    }

    copyDirIfNotExists(from: string, to: string) {
        return awaiter(function* () {
            const files = fs.readdirSync(from);
            files.forEach((file) => awaiter(function* () {
                const source = path.join(from, file);
                const target = path.join(to, file);
                if ((fs.statSync(source)).isDirectory()) {
                    this.copyDirIfNotExists(source, target).catch(function (e: Error) {
                        vscode.window.showErrorMessage(e.message);
                    });
                } else if (!fs.existsSync(target)) {
                    const dir = path.dirname(target);
                    if (!fs.existsSync(dir)) {
                        fs.mkdirSync(dir, { recursive: true });
                    }
                    fs.copyFileSync(source, target);
                }
            }.bind(this)));
        }.bind(this));
    }
}

export class Project {
    config: ProjectConfig;
    projectDirUri: Uri;
    projectDir: string;

    private watcher: vscode.FileSystemWatcher;

    constructor(projectDirUri: Uri) {
        this.projectDirUri = projectDirUri;
        let projectDir = this.projectDir = projectDirUri.fsPath;

        if (!fs.statSync(projectDir).isDirectory()) {
            if (path.basename(projectDir) !== 'project.json') {
                vscode.window.showErrorMessage(`项目初始化路径 "${projectDir}" 需为目录`);
                return Object.create(null);
            }
            projectDir = path.dirname(projectDir);
        }

        let jsonPath = path.join(projectDir, 'project.json');
        if (!fs.existsSync(jsonPath)) {
            vscode.window.showErrorMessage(`缺少必要的项目配置文件: ${jsonPath}`);
            return Object.create(null);
        }

        this.config = ProjectConfig.fromJsonFile(jsonPath);
        this.watcher = vscode.workspace.createFileSystemWatcher(new vscode.RelativePattern(projectDir, 'project\.json'));
        this.watcher.onDidChange((event) => {
            logDebug('file changed: ', event.fsPath);
            if (event.fsPath === path.join(projectDir, 'project.json')) {
                this.config = ProjectConfig.fromJsonFile(event.fsPath);
                logDebug('project.json changed: ', this.config);
            }
        });
    }

    // noinspection JSUnusedLocalSymbols
    fileFilter(relativePath: string, absPath: string, stats: fs.Stats): boolean {
        // 解析真实路径
        const realAbsPath = fs.realpathSync(absPath);
        return this.config.ignore.filter((p) => {
            const fullPath = path.join(this.projectDir, p);
            // 同样解析 ignore 路径对应的真实路径
            try {
                const realFullPath = fs.realpathSync(fullPath);
                return realAbsPath.startsWith(realFullPath);
            } catch (err) {
                // 出现错误时忽略该 ignore 配置
                return false;
            }
        }).length === 0;
    };

    dispose() {
        this.watcher.dispose();
    }
}

export class ProjectObserver {
    folder: string;
    private isDiffed: boolean;
    private fileObserver: FileObserver;
    private fileFilter: FileFilter;

    constructor(folder: string, filter: FileFilter) {
        this.isDiffed = false;
        this.folder = folder;
        this.fileFilter = filter;
        this.fileObserver = new FileObserver(folder, filter);
    }

    diff() {
        return this.fileObserver.walk()
            .then((fileChanges) => {
                const zip = archiver('zip');
                const streamBuffer = new streamBuffers.WritableStreamBuffer();
                zip.pipe(streamBuffer);
                fileChanges.modified.forEach((relativePath: string) => {
                    zip.append(fs.createReadStream(path.join(this.folder, relativePath)), { name: relativePath });
                });
                zip.finalize();
                return new Promise<{ buffer: Buffer, deletedFiles: string[] }>((resolve) => {
                    zip.on('finish', () => {
                        streamBuffer.end();
                        resolve({
                            buffer: streamBuffer.getContents() as Buffer,
                            deletedFiles: fileChanges.deleted,
                        });
                    });
                });
            })
            .then((result) => {
                let md5 = crypto.createHash('md5').update(result.buffer).digest('hex');
                let isDiffed = this.isDiffed;
                this.isDiffed = true;
                logDebug(Array.from(result.buffer).map(x => x >= 128 ? x - 256 : x).join(','));
                return {
                    buffer: result.buffer,
                    md5: md5,
                    deletedFiles: result.deletedFiles,
                    full: isDiffed,
                };
            });
    }
}

export class LaunchConfig {
    private displaySplash: boolean;
    private hideLogs: boolean;
    private splashText: string;
    private stableMode: boolean;

    constructor() {
        this.displaySplash = true;
        this.hideLogs = false;
        this.splashText = 'Powered by AutoJs6';
        this.stableMode = false;
    }
}

export class ProjectConfig {
    name: string;
    versionCode: number;
    versionName: string;
    ignore: string[];
    launchConfig: LaunchConfig;
    private optimization: Optimization;
    private encryptLevel: number;
    private useFeatures: string[];
    private scriptConfigs: Map<any, any>;
    private assets: string[];

    constructor() {
        this.versionCode = 1;
        this.versionName = '1.0.0';
        this.launchConfig = new LaunchConfig();
        this.encryptLevel = 0;
        this.assets = [];
        this.useFeatures = [];
        this.optimization = new Optimization();
        this.scriptConfigs = new Map();
    }

    save(path: string) {
        return new Promise((res, rej) => {
            const json = JSON.stringify(this, null, 4);
            fs.writeFile(path, json, function (err) {
                if (err) {
                    rej(err);
                    return;
                }
                res(path);
            });
        });
    }

    static fromJsonFile(path: string): ProjectConfig {
        const text = fs.readFileSync(path).toString('utf-8');
        const config = JSON.parse(text) as ProjectConfig;
        config.ignore = (config.ignore || []);
        return config;
    }

    static fromJson(text: string) {
        const config = JSON.parse(text);
        config.ignore = (config.ignore || []).map((p: string) => path.normalize(p));
        return config;
    }
}

class Optimization {
    private removeOpenCv: boolean;
    private unusedResources: boolean;
    private removeAccessibilityService: boolean;

    constructor() {
        this.removeOpenCv = false;
        this.unusedResources = false;
        this.removeAccessibilityService = false;
    }
}