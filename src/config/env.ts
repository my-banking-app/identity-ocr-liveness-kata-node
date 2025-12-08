import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  logLevel: process.env.LOG_LEVEL || 'info',
  corsOrigin: process.env.CORS_ORIGIN || '*',
  jwt: {
    secret: process.env.JWT_SECRET || 'default_secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    refreshSecret: process.env.REFRESH_TOKEN_SECRET || 'default_refresh_secret',
    refreshExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
  },
  security: {
    aesKey: process.env.AES_ENCRYPTION_KEY || '12345678901234567890123456789012',
    sessionSecret: process.env.SESSION_SECRET || 'default_session_secret',
  },
  llm: {
    provider: process.env.LLM_PROVIDER || 'openai', // 'openai' | 'anthropic' | 'ollama'
    openaiApiKey: process.env.OPENAI_API_KEY || '',
    anthropicApiKey: process.env.ANTHROPIC_API_KEY || '',
    model: process.env.LLM_MODEL || 'gpt-3.5-turbo',
    temperature: parseFloat(process.env.LLM_TEMPERATURE || '0.1'),
    maxTokens: parseInt(process.env.LLM_MAX_TOKENS || '1000', 10),
  },
};
