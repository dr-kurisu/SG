import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

const SECRET_KEY = 'your-secret-key';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

const whitelist = ['/api/account/login', '/api/account/register'];

const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  if (whitelist.includes(req.path) || process.env.NODE_ENV==="" || process.env.NODE_ENV === "test") {
    req.user = { user_id: 'admin' };
    return next();
  }
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1]; // Bearer <token>

  if (!token) {
    res.status(401).json({ message: 'Access denied. No token provided' });
    return;
  }

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err || !decoded) {
      res.status(403).json({ message: 'Invalid or expired token' });
      return;
    }

    const payload = decoded as JwtPayload;
    if (!payload) {
      res.status(400).json({ message: 'Token without required payload' });
      return;
    }
    if (!payload.user_id || typeof payload.user_id !== 'string') {
      res.status(400).json({ message: 'Token without required user_id' });
      return;
    }
    req.user = payload;
    next();
  });
};

export default authenticateToken;