import express from "express";
import {Request, Response} from "express";
import { insertMusicRecord } from "../services/music";
import { upload } from "./storageRoutes";

const musicRouter = express();

// music/list 返回目录下的所有音乐文件列表
musicRouter.get('/list', async (req: Request, res: Response) => {
    const pathQuery = req.query.path as string | "/";
    // to do
    
});
// music/addMusic 增加音乐文件
musicRouter.post('/add', upload.single('file'), async (req: Request, res: Response) => {
    if (!req.file) {
        res.status(400).send('No file uploaded')
        return
    }
    const { artist, album, year, duration } = req.body;
    const user_id = "admin";
    const relativePath = req.query.path as string || "/";

    // 插入音乐记录到数据库
    try {
        await insertMusicRecord(
            user_id,
            req.file.filename,
            relativePath,
            duration,
            req.file.mimetype,
            req.file.size,
        );
    } catch (error) {
        console.error('Error inserting music record:', error);
        res.status(500).send('Error saving music record');
        return;
    }

    res.send({
        message: 'File uploaded successfully',
        file: req.file
    });
});

// music/remove/:id 移除指定音乐文件

// music/audio/:id 获取指定音乐文件



export default musicRouter;