import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { device, deviceId } from './device';
import type { mfa, mfaId } from './mfa';
import type { user, userId } from './user';

export interface mfa_x_userAttributes {
  id: string;
  mfa_id?: string;
  user_id?: string;
  device_id?: string;
}

export type mfa_x_userPk = "id";
export type mfa_x_userId = mfa_x_user[mfa_x_userPk];
export type mfa_x_userOptionalAttributes = "mfa_id" | "user_id" | "device_id";
export type mfa_x_userCreationAttributes = Optional<mfa_x_userAttributes, mfa_x_userOptionalAttributes>;

export class mfa_x_user extends Model<mfa_x_userAttributes, mfa_x_userCreationAttributes> implements mfa_x_userAttributes {
  id!: string;
  mfa_id?: string;
  user_id?: string;
  device_id?: string;

  // mfa_x_user belongsTo device via device_id
  device!: device;
  getDevice!: Sequelize.BelongsToGetAssociationMixin<device>;
  setDevice!: Sequelize.BelongsToSetAssociationMixin<device, deviceId>;
  createDevice!: Sequelize.BelongsToCreateAssociationMixin<device>;
  // mfa_x_user belongsTo mfa via mfa_id
  mfa!: mfa;
  getMfa!: Sequelize.BelongsToGetAssociationMixin<mfa>;
  setMfa!: Sequelize.BelongsToSetAssociationMixin<mfa, mfaId>;
  createMfa!: Sequelize.BelongsToCreateAssociationMixin<mfa>;
  // mfa_x_user belongsTo user via user_id
  user!: user;
  getUser!: Sequelize.BelongsToGetAssociationMixin<user>;
  setUser!: Sequelize.BelongsToSetAssociationMixin<user, userId>;
  createUser!: Sequelize.BelongsToCreateAssociationMixin<user>;

  static initModel(sequelize: Sequelize.Sequelize): typeof mfa_x_user {
    return mfa_x_user.init({
    id: {
      type: DataTypes.STRING(50),
      allowNull: false,
      primaryKey: true
    },
    mfa_id: {
      type: DataTypes.STRING(50),
      allowNull: true,
      references: {
        model: 'mfa',
        key: 'id'
      }
    },
    user_id: {
      type: DataTypes.STRING(50),
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    device_id: {
      type: DataTypes.STRING(50),
      allowNull: true,
      references: {
        model: 'devices',
        key: 'id'
      }
    }
  }, {
    sequelize,
    tableName: 'mfa_x_user',
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
        name: "mfa_id",
        using: "BTREE",
        fields: [
          { name: "mfa_id" },
        ]
      },
      {
        name: "user_id",
        using: "BTREE",
        fields: [
          { name: "user_id" },
        ]
      },
      {
        name: "device_id",
        using: "BTREE",
        fields: [
          { name: "device_id" },
        ]
      },
    ]
  });
  }
}
