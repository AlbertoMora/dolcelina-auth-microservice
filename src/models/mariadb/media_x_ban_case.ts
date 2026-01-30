import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { ban_case, ban_caseId } from './ban_case';

export interface media_x_ban_caseAttributes {
  id: string;
  ban_case_id?: string;
  uri: string;
}

export type media_x_ban_casePk = "id";
export type media_x_ban_caseId = media_x_ban_case[media_x_ban_casePk];
export type media_x_ban_caseOptionalAttributes = "ban_case_id";
export type media_x_ban_caseCreationAttributes = Optional<media_x_ban_caseAttributes, media_x_ban_caseOptionalAttributes>;

export class media_x_ban_case extends Model<media_x_ban_caseAttributes, media_x_ban_caseCreationAttributes> implements media_x_ban_caseAttributes {
  id!: string;
  ban_case_id?: string;
  uri!: string;

  // media_x_ban_case belongsTo ban_case via ban_case_id
  ban_case!: ban_case;
  getBan_case!: Sequelize.BelongsToGetAssociationMixin<ban_case>;
  setBan_case!: Sequelize.BelongsToSetAssociationMixin<ban_case, ban_caseId>;
  createBan_case!: Sequelize.BelongsToCreateAssociationMixin<ban_case>;

  static initModel(sequelize: Sequelize.Sequelize): typeof media_x_ban_case {
    return media_x_ban_case.init({
    id: {
      type: DataTypes.STRING(50),
      allowNull: false,
      primaryKey: true
    },
    ban_case_id: {
      type: DataTypes.STRING(50),
      allowNull: true,
      references: {
        model: 'ban_cases',
        key: 'id'
      }
    },
    uri: {
      type: DataTypes.STRING(300),
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'media_x_ban_cases',
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
        name: "media_x_ban_case_fk1",
        using: "BTREE",
        fields: [
          { name: "ban_case_id" },
        ]
      },
    ]
  });
  }
}
