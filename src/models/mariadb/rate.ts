import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { lyric, lyricId } from './lyric';
import type { user, userId } from './user';

export interface rateAttributes {
  id: string;
  rate: number;
  review?: string;
  lyrics_id: string;
  user_id: string;
}

export type ratePk = "id";
export type rateId = rate[ratePk];
export type rateOptionalAttributes = "review";
export type rateCreationAttributes = Optional<rateAttributes, rateOptionalAttributes>;

export class rate extends Model<rateAttributes, rateCreationAttributes> implements rateAttributes {
  id!: string;
  rate!: number;
  review?: string;
  lyrics_id!: string;
  user_id!: string;

  // rate belongsTo lyric via lyrics_id
  lyric!: lyric;
  getLyric!: Sequelize.BelongsToGetAssociationMixin<lyric>;
  setLyric!: Sequelize.BelongsToSetAssociationMixin<lyric, lyricId>;
  createLyric!: Sequelize.BelongsToCreateAssociationMixin<lyric>;
  // rate belongsTo user via user_id
  user!: user;
  getUser!: Sequelize.BelongsToGetAssociationMixin<user>;
  setUser!: Sequelize.BelongsToSetAssociationMixin<user, userId>;
  createUser!: Sequelize.BelongsToCreateAssociationMixin<user>;

  static initModel(sequelize: Sequelize.Sequelize): typeof rate {
    return rate.init({
    id: {
      type: DataTypes.STRING(50),
      allowNull: false,
      primaryKey: true
    },
    rate: {
      type: DataTypes.DECIMAL(2,1),
      allowNull: false
    },
    review: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    lyrics_id: {
      type: DataTypes.STRING(50),
      allowNull: false,
      references: {
        model: 'lyrics',
        key: 'id'
      }
    },
    user_id: {
      type: DataTypes.STRING(50),
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    }
  }, {
    sequelize,
    tableName: 'rates',
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
        name: "lyrics_id",
        using: "BTREE",
        fields: [
          { name: "lyrics_id" },
        ]
      },
      {
        name: "user_id",
        using: "BTREE",
        fields: [
          { name: "user_id" },
        ]
      },
    ]
  });
  }
}
