import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config/env';
import { IUser, ITokenPayload, LoginResponse } from '../types/auth.types';
import { CryptoService } from './crypto.service';

// Mock database
const users: IUser[] = [];
const refreshTokens: string[] = []; // In a real app, store this in DB/Redis
const revokedTokens = new Set<string>();

export class AuthService {
  static async register(userData: any): Promise<IUser> {
    const { email, password, name } = userData;

    const existingUser = users.find((u) => u.email === email);
    if (existingUser) {
      throw new Error('User already exists');
    }

    const passwordHash = await CryptoService.hashPassword(password);

    const newUser: IUser = {
      id: uuidv4(),
      email,
      passwordHash,
      name,
      role: 'user',
    };

    users.push(newUser);
    return newUser;
  }

  static async login(credentials: any): Promise<LoginResponse> {
    const { email, password } = credentials;

    const user = users.find((u) => u.email === email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isPasswordValid = await CryptoService.comparePassword(
      password,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    refreshTokens.push(refreshToken);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  static async refreshToken(token: string): Promise<string> {
    if (revokedTokens.has(token) || !refreshTokens.includes(token)) {
      throw new Error('Invalid refresh token');
    }

    try {
      const payload = jwt.verify(
        token,
        config.jwt.refreshSecret,
      ) as ITokenPayload;
      
      // Check if user still exists
      const user = users.find(u => u.id === payload.userId);
      if (!user) throw new Error('User not found');

      return this.generateAccessToken(user);
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  static async logout(token: string): Promise<void> {
    const index = refreshTokens.indexOf(token);
    if (index > -1) {
      refreshTokens.splice(index, 1);
    }
    revokedTokens.add(token);
  }

  private static generateAccessToken(user: IUser): string {
    const payload: ITokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };
    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn as jwt.SignOptions['expiresIn'],
    });
  }

  private static generateRefreshToken(user: IUser): string {
    const payload: ITokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };
    return jwt.sign(payload, config.jwt.refreshSecret, {
      expiresIn: config.jwt.refreshExpiresIn as jwt.SignOptions['expiresIn'],
    });
  }
}
