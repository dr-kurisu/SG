// Diary api file

import { TypRenderer } from "./typRenderer";
import express from 'express';
const typRouter = express();
import path from 'path';
import fs from 'fs';

typRouter.post('/compile', (req, res) => {
    const { entryFile, outDir } = req.body;
    if (!entryFile) {
        res.status(400).json({ error: 'entryFile is required' });
        return;
    }

    try {
        const renderer = new TypRenderer(entryFile, outDir);
        renderer.compile();

        const entryName = path.basename(entryFile, '.typ');
        const pdfPath = path.join(outDir || './out', `${entryName}.pdf`);

        if (fs.existsSync(pdfPath)) {
            res.download(pdfPath);
        } else {
            res.status(500).json({ error: 'Compilation failed' });
        }
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

typRouter.post('/watch', (req, res) => {
    const { entryFile, outDir } = req.body;
    if (!entryFile) {
        res.status(400).json({ error: 'entryFile is required' });
        return;
    }

    try {
        const renderer = new TypRenderer(entryFile, outDir);
        renderer.watch(() => {
            console.log(`[watcher] ${entryFile} changed and recompiled.`);
        });
        res.json({ message: 'Watch started' });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default typRouter;