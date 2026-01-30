import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { mfa_x_user, mfa_x_userId } from './mfa_x_user';

export interface deviceAttributes {
  id: string;
  device_name?: string;
  serial_number?: string;
  device_type?: string;
  brand?: string;
  model?: string;
  status?: string;
  location?: string;
  user_id?: string;
  devicePass: string;
  rsa_pub_key?: string;
}

export type devicePk = "id";
export type deviceId = device[devicePk];
export type deviceOptionalAttributes = "device_name" | "serial_number" | "device_type" | "brand" | "model" | "status" | "location" | "user_id" | "rsa_pub_key";
export type deviceCreationAttributes = Optional<deviceAttributes, deviceOptionalAttributes>;

export class device extends Model<deviceAttributes, deviceCreationAttributes> implements deviceAttributes {
  id!: string;
  device_name?: string;
  serial_number?: string;
  device_type?: string;
  brand?: string;
  model?: string;
  status?: string;
  location?: string;
  user_id?: string;
  devicePass!: string;
  rsa_pub_key?: string;

  // device hasMany mfa_x_user via device_id
  mfa_x_users!: mfa_x_user[];
  getMfa_x_users!: Sequelize.HasManyGetAssociationsMixin<mfa_x_user>;
  setMfa_x_users!: Sequelize.HasManySetAssociationsMixin<mfa_x_user, mfa_x_userId>;
  addMfa_x_user!: Sequelize.HasManyAddAssociationMixin<mfa_x_user, mfa_x_userId>;
  addMfa_x_users!: Sequelize.HasManyAddAssociationsMixin<mfa_x_user, mfa_x_userId>;
  createMfa_x_user!: Sequelize.HasManyCreateAssociationMixin<mfa_x_user>;
  removeMfa_x_user!: Sequelize.HasManyRemoveAssociationMixin<mfa_x_user, mfa_x_userId>;
  removeMfa_x_users!: Sequelize.HasManyRemoveAssociationsMixin<mfa_x_user, mfa_x_userId>;
  hasMfa_x_user!: Sequelize.HasManyHasAssociationMixin<mfa_x_user, mfa_x_userId>;
  hasMfa_x_users!: Sequelize.HasManyHasAssociationsMixin<mfa_x_user, mfa_x_userId>;
  countMfa_x_users!: Sequelize.HasManyCountAssociationsMixin;

  static initModel(sequelize: Sequelize.Sequelize): typeof device {
    return device.init({
    id: {
      type: DataTypes.STRING(50),
      allowNull: false,
      primaryKey: true
    },
    device_name: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    serial_number: {
      type: DataTypes.STRING(255),
      allowNull: true,
      unique: "serial_number"
    },
    device_type: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    brand: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    model: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    location: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    user_id: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    devicePass: {
      type: DataTypes.STRING(500),
      allowNull: false
    },
    rsa_pub_key: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'devices',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "serial_number",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "serial_number" },
        ]
      },
    ]
  });
  }
}
