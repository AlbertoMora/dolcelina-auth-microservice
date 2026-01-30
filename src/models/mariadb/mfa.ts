import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { mfa_x_user, mfa_x_userId } from './mfa_x_user';

export interface mfaAttributes {
  id: string;
  name: string;
  description?: string;
  priority?: number;
}

export type mfaPk = "id";
export type mfaId = mfa[mfaPk];
export type mfaOptionalAttributes = "description" | "priority";
export type mfaCreationAttributes = Optional<mfaAttributes, mfaOptionalAttributes>;

export class mfa extends Model<mfaAttributes, mfaCreationAttributes> implements mfaAttributes {
  id!: string;
  name!: string;
  description?: string;
  priority?: number;

  // mfa hasMany mfa_x_user via mfa_id
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

  static initModel(sequelize: Sequelize.Sequelize): typeof mfa {
    return mfa.init({
    id: {
      type: DataTypes.STRING(50),
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(70),
      allowNull: false
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    priority: {
      type: DataTypes.TINYINT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'mfa',
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
    ]
  });
  }
}
