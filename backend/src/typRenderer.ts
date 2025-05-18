import { execSync } from "child_process";
import { watch } from 'chokidar';
import path from 'path'

export class TypRenderer {
    private outDir: string;
    private typstEntry: string;

    constructor(entryFile: string, outDir: string='/') {
        this.outDir = outDir;
        this.typstEntry = entryFile;
    }
    
    // Basically run the command locally
    public compile(): Buffer {
        const cmd = `typst compile ${this.typstEntry} ${path.join(this.outDir, `${this.typstEntry}.pdf`)}`;
        return execSync(cmd);
    }

    // monitoring the change of file
    public watch(callback?: ()=> void) {
        watch(path.dirname(this.typstEntry)).on('change', (filePath) => {
            if (filePath.endsWith('.typ')) {
                this.compile();
                callback?.();
            } 
        })
    }
}