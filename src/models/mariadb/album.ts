import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { artist, artistId } from './artist';
import type { lyric, lyricId } from './lyric';
import type { user, userId } from './user';

export interface albumAttributes {
  id: string;
  name: string;
  year?: string;
  artist_id: string;
  format?: string;
  album_banner_uri?: string;
  posted_by?: string;
}

export type albumPk = "id";
export type albumId = album[albumPk];
export type albumOptionalAttributes = "year" | "format" | "album_banner_uri" | "posted_by";
export type albumCreationAttributes = Optional<albumAttributes, albumOptionalAttributes>;

export class album extends Model<albumAttributes, albumCreationAttributes> implements albumAttributes {
  id!: string;
  name!: string;
  year?: string;
  artist_id!: string;
  format?: string;
  album_banner_uri?: string;
  posted_by?: string;

  // album hasMany lyric via album_id
  lyrics!: lyric[];
  getLyrics!: Sequelize.HasManyGetAssociationsMixin<lyric>;
  setLyrics!: Sequelize.HasManySetAssociationsMixin<lyric, lyricId>;
  addLyric!: Sequelize.HasManyAddAssociationMixin<lyric, lyricId>;
  addLyrics!: Sequelize.HasManyAddAssociationsMixin<lyric, lyricId>;
  createLyric!: Sequelize.HasManyCreateAssociationMixin<lyric>;
  removeLyric!: Sequelize.HasManyRemoveAssociationMixin<lyric, lyricId>;
  removeLyrics!: Sequelize.HasManyRemoveAssociationsMixin<lyric, lyricId>;
  hasLyric!: Sequelize.HasManyHasAssociationMixin<lyric, lyricId>;
  hasLyrics!: Sequelize.HasManyHasAssociationsMixin<lyric, lyricId>;
  countLyrics!: Sequelize.HasManyCountAssociationsMixin;
  // album belongsTo artist via artist_id
  artist!: artist;
  getArtist!: Sequelize.BelongsToGetAssociationMixin<artist>;
  setArtist!: Sequelize.BelongsToSetAssociationMixin<artist, artistId>;
  createArtist!: Sequelize.BelongsToCreateAssociationMixin<artist>;
  // album belongsTo user via posted_by
  posted_by_user!: user;
  getPosted_by_user!: Sequelize.BelongsToGetAssociationMixin<user>;
  setPosted_by_user!: Sequelize.BelongsToSetAssociationMixin<user, userId>;
  createPosted_by_user!: Sequelize.BelongsToCreateAssociationMixin<user>;

  static initModel(sequelize: Sequelize.Sequelize): typeof album {
    return album.init({
    id: {
      type: DataTypes.STRING(50),
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    year: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    artist_id: {
      type: DataTypes.STRING(50),
      allowNull: false,
      references: {
        model: 'artists',
        key: 'id'
      }
    },
    format: {
      type: DataTypes.CHAR(1),
      allowNull: true
    },
    album_banner_uri: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    posted_by: {
      type: DataTypes.STRING(50),
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    }
  }, {
    sequelize,
    tableName: 'albums',
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
        name: "posted_by",
        using: "BTREE",
        fields: [
          { name: "posted_by" },
        ]
      },
      {
        name: "artist_id",
        using: "BTREE",
        fields: [
          { name: "artist_id" },
        ]
      },
    ]
  });
  }
}
