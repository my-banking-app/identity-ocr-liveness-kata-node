import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../config/database';

export class Document extends Model {
  public id!: number;
  public documentNumber!: string;
  public documentType!: 'cedula' | 'passport' | 'license';
  public status!: 'valid' | 'expired' | 'suspended' | 'cancelled';
  public issueDate!: Date;
  public expiryDate!: Date;
  public issuingEntity!: string;
  public biometricHash!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Document.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    documentNumber: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
    },
    documentType: {
      type: DataTypes.ENUM('cedula', 'passport', 'license'),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('valid', 'expired', 'suspended', 'cancelled'),
      defaultValue: 'valid',
    },
    issueDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    expiryDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    issuingEntity: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    biometricHash: {
      type: DataTypes.STRING(64),
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'documents',
  }
);
