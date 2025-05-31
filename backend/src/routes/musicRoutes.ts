import express from "express";
import {Request, Response} from "express";
import { getFileList } from "../services/storage";
import { upload } from "./storageRoutes";

const musicRouter = express();

// music/list 返回目录下的所有音乐文件列表
musicRouter.get('/list', async (req: Request, res: Response) => {
    const pathQuery = req.query.path as string | "/";
    try {
        const result = getFileList("/Music" + pathQuery);
        res.status(200).send(result);
    } catch (err: any) {
        res.status(500).send(err.message);
    }
});
// music/addMusic 增加音乐文件
musicRouter.post('/add', upload.single('file'), async (req: Request, res: Response) => {
    if (!req.file) {
        res.status(400).send('No file uploaded')
        return
    }
    res.send({
        message: 'File uploaded successfully',
        file: req.file
    })
});

// music/remove/:id 移除指定音乐文件

// music/audio/:id 获取指定音乐文件



export default musicRouter;