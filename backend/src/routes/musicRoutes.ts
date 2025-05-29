import express from "express";
import {Request, Response} from "express";
import { getFileList } from "../services/storage";

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

})
// music/

export default musicRouter;