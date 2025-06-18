import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { UserHandler } from "../services/userModel";

const accountRouter = express.Router();

const SECRET_KEY = "your-secret-key";

// 登录接口
accountRouter.post("/login", async (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({message: "Required field username or password is empty"});
    return;
  }

  // 调用对应函数查找用户
  const user_id = await UserHandler.checkUser(username);

  if (!user_id) {
    res.status(401).json({ message: "User does not exist" });
    return;
  }

  // 调用对应函数匹配密码
  const result = await UserHandler.verifyUser(username, password);
  if (!result) {
    res.status(401).json({ error: "用户名或密码错误" });
    return;
  }

  // 登录成功，签发 JWT
  const token = jwt.sign(
    {
        user_id: user_id,
        username: username,
    },
    SECRET_KEY,
    { expiresIn: "1h" }
  );

  res.json({ 
    token,
    user: {
      id: user_id,
      username,
    }
  });
});

// 注册接口
accountRouter.post("/register", async (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ message: "Username and password are required" });
    return;
  }
  // 查看用户是否已经存在
  const user_id = await UserHandler.checkUser(username);
  if (user_id) {
    res.status(401).json({message: "User already exist"});
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  // 数据库注入用户信息
  const id = await UserHandler.insertUser(username, password);
  if (id) {
    res.status(201).json({ message: "Successfully registered user"});
  }else {
    res.status(500).json({ message: "Database error: Cannot insert user info"});
  }
});

export default accountRouter;
