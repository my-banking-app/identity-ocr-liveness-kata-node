import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { IAuthRequest, ITokenPayload } from '../types/auth.types';

export const authenticateToken = (
  req: IAuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const user = jwt.verify(token, config.jwt.secret) as ITokenPayload;
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};
