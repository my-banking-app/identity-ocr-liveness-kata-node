import { Sequelize } from 'sequelize';
import path from 'path';
import logger from '../utils/logger';

const isProduction = process.env.NODE_ENV === 'production';

let sequelize: Sequelize;

if (process.env.DATABASE_URL) {
  // Use Postgres in Docker/Production
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: (msg) => logger.debug(msg),
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    dialectOptions: {
      ssl: process.env.DB_SSL === 'true' ? {
        require: true,
        rejectUnauthorized: false
      } : false
    }
  });
} else {
  // Default to SQLite for local dev
  const dbPath = path.join(__dirname, '../../database.sqlite');
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: dbPath,
    logging: (msg) => logger.debug(msg),
  });
}

export { sequelize };

export const initDatabase = async () => {
  try {
    await sequelize.authenticate();
    logger.info(`Database connection established successfully (${sequelize.getDialect()}).`);
    // Sync models
    await sequelize.sync(); 
    logger.info('Database models synced.');
  } catch (error) {
    logger.error('Unable to connect to the database:', error);
  }
};
