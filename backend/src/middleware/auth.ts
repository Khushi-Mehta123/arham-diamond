import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access denied: token missing' });
  }

  try {
    const secret = process.env.JWT_SECRET || 'supersecretjwtkey123!@#';
    const decoded = jwt.verify(token, secret) as { id: string; role: string };
    (req as AuthRequest).user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Access denied: invalid token' });
  }
};

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  const authReq = req as AuthRequest;
  if (!authReq.user || authReq.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied: admin access required' });
  }
  next();
};
