import { Request } from 'express';
import { JwtPayload } from 'jsonwebtoken';

export interface IUser {
  id: string;
  email: string;
  passwordHash: string;
  role: 'user' | 'admin';
  name: string;
}

export interface ITokenPayload extends JwtPayload {
  userId: string;
  role: string;
  email: string;
}

export interface IAuthRequest extends Request {
  user?: ITokenPayload;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}
