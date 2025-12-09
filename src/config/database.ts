import { Sequelize } from 'sequelize';
import path from 'path';
import logger from '../utils/logger';

const isProduction = process.env.NODE_ENV === 'production';

const sequelize: Sequelize = process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, {
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
    })
  : new Sequelize({
      dialect: 'sqlite',
      storage: path.join(__dirname, '../../database.sqlite'),
      logging: (msg) => logger.debug(msg),
    });

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
