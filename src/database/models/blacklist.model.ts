import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../config/database';

export class Blacklist extends Model {
  public id!: number;
  public documentNumber!: string;
  public reason!: 'lost' | 'stolen' | 'fraud' | 'cancelled';
  public reportingEntity!: string;
  public isActive!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Blacklist.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    documentNumber: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    reason: {
      type: DataTypes.ENUM('lost', 'stolen', 'fraud', 'cancelled'),
      allowNull: false,
    },
    reportingEntity: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: 'blacklist',
    indexes: [
        {
            unique: false,
            fields: ['documentNumber']
        }
    ]
  }
);
