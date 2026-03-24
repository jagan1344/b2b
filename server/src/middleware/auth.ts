import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, TokenPayload } from '../utils/jwt';

declare global {
  namespace Express {
    interface Request {
      teacher?: TokenPayload;
    }
  }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Access token required.' });
    return;
  }

  try {
    const token = authHeader.split(' ')[1];
    const payload = verifyAccessToken(token);
    req.teacher = payload;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired access token.' });
  }
}

export function principalOnly(req: Request, res: Response, next: NextFunction): void {
  if (!req.teacher || req.teacher.role !== 'principal') {
    res.status(403).json({ error: 'Only principals can perform this action.' });
    return;
  }
  next();
}
