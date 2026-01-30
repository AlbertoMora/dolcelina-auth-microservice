import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { album, albumId } from './album';
import type { lyric, lyricId } from './lyric';
import type { user, userId } from './user';
import type { view, viewId } from './view';

export interface artistAttributes {
  id: string;
  name?: string;
  description?: string;
  image_uri?: string;
  posted_by: string;
  is_verified?: boolean;
}

export type artistPk = "id";
export type artistId = artist[artistPk];
export type artistOptionalAttributes = "name" | "description" | "image_uri" | "posted_by" | "is_verified";
export type artistCreationAttributes = Optional<artistAttributes, artistOptionalAttributes>;

export class artist extends Model<artistAttributes, artistCreationAttributes> implements artistAttributes {
  id!: string;
  name?: string;
  description?: string;
  image_uri?: string;
  posted_by!: string;
  is_verified?: boolean;

  // artist hasMany album via artist_id
  albums!: album[];
  getAlbums!: Sequelize.HasManyGetAssociationsMixin<album>;
  setAlbums!: Sequelize.HasManySetAssociationsMixin<album, albumId>;
  addAlbum!: Sequelize.HasManyAddAssociationMixin<album, albumId>;
  addAlbums!: Sequelize.HasManyAddAssociationsMixin<album, albumId>;
  createAlbum!: Sequelize.HasManyCreateAssociationMixin<album>;
  removeAlbum!: Sequelize.HasManyRemoveAssociationMixin<album, albumId>;
  removeAlbums!: Sequelize.HasManyRemoveAssociationsMixin<album, albumId>;
  hasAlbum!: Sequelize.HasManyHasAssociationMixin<album, albumId>;
  hasAlbums!: Sequelize.HasManyHasAssociationsMixin<album, albumId>;
  countAlbums!: Sequelize.HasManyCountAssociationsMixin;
  // artist hasMany lyric via artist_id
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
  // artist hasMany view via artist_id
  views!: view[];
  getViews!: Sequelize.HasManyGetAssociationsMixin<view>;
  setViews!: Sequelize.HasManySetAssociationsMixin<view, viewId>;
  addView!: Sequelize.HasManyAddAssociationMixin<view, viewId>;
  addViews!: Sequelize.HasManyAddAssociationsMixin<view, viewId>;
  createView!: Sequelize.HasManyCreateAssociationMixin<view>;
  removeView!: Sequelize.HasManyRemoveAssociationMixin<view, viewId>;
  removeViews!: Sequelize.HasManyRemoveAssociationsMixin<view, viewId>;
  hasView!: Sequelize.HasManyHasAssociationMixin<view, viewId>;
  hasViews!: Sequelize.HasManyHasAssociationsMixin<view, viewId>;
  countViews!: Sequelize.HasManyCountAssociationsMixin;
  // artist belongsTo user via posted_by
  posted_by_user!: user;
  getPosted_by_user!: Sequelize.BelongsToGetAssociationMixin<user>;
  setPosted_by_user!: Sequelize.BelongsToSetAssociationMixin<user, userId>;
  createPosted_by_user!: Sequelize.BelongsToCreateAssociationMixin<user>;

  static initModel(sequelize: Sequelize.Sequelize): typeof artist {
    return artist.init({
    id: {
      type: DataTypes.STRING(50),
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    description: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    image_uri: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    posted_by: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: "a",
      references: {
        model: 'users',
        key: 'id'
      }
    },
    is_verified: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false
    }
  }, {
    sequelize,
    tableName: 'artists',
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
        name: "artists_users_FK",
        using: "BTREE",
        fields: [
          { name: "posted_by" },
        ]
      },
    ]
  });
  }
}
