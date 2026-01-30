import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { album, albumId } from './album';
import type { artist, artistId } from './artist';
import type { rate, rateId } from './rate';
import type { user, userId } from './user';
import type { view, viewId } from './view';

export interface lyricAttributes {
  id: string;
  name: string;
  lyrics_text: string;
  genre?: string;
  sample_uri?: string;
  bpm?: number;
  key?: string;
  artist_id: string;
  posted_by: string;
  fork_of?: string;
  creation_date: Date;
  last_modified: Date;
  album_id?: string;
}

export type lyricPk = "id";
export type lyricId = lyric[lyricPk];
export type lyricOptionalAttributes = "genre" | "sample_uri" | "bpm" | "key" | "fork_of" | "album_id";
export type lyricCreationAttributes = Optional<lyricAttributes, lyricOptionalAttributes>;

export class lyric extends Model<lyricAttributes, lyricCreationAttributes> implements lyricAttributes {
  id!: string;
  name!: string;
  lyrics_text!: string;
  genre?: string;
  sample_uri?: string;
  bpm?: number;
  key?: string;
  artist_id!: string;
  posted_by!: string;
  fork_of?: string;
  creation_date!: Date;
  last_modified!: Date;
  album_id?: string;

  // lyric belongsTo album via album_id
  album!: album;
  getAlbum!: Sequelize.BelongsToGetAssociationMixin<album>;
  setAlbum!: Sequelize.BelongsToSetAssociationMixin<album, albumId>;
  createAlbum!: Sequelize.BelongsToCreateAssociationMixin<album>;
  // lyric belongsTo artist via artist_id
  artist!: artist;
  getArtist!: Sequelize.BelongsToGetAssociationMixin<artist>;
  setArtist!: Sequelize.BelongsToSetAssociationMixin<artist, artistId>;
  createArtist!: Sequelize.BelongsToCreateAssociationMixin<artist>;
  // lyric belongsTo lyric via fork_of
  fork_of_lyric!: lyric;
  getFork_of_lyric!: Sequelize.BelongsToGetAssociationMixin<lyric>;
  setFork_of_lyric!: Sequelize.BelongsToSetAssociationMixin<lyric, lyricId>;
  createFork_of_lyric!: Sequelize.BelongsToCreateAssociationMixin<lyric>;
  // lyric hasMany rate via lyrics_id
  rates!: rate[];
  getRates!: Sequelize.HasManyGetAssociationsMixin<rate>;
  setRates!: Sequelize.HasManySetAssociationsMixin<rate, rateId>;
  addRate!: Sequelize.HasManyAddAssociationMixin<rate, rateId>;
  addRates!: Sequelize.HasManyAddAssociationsMixin<rate, rateId>;
  createRate!: Sequelize.HasManyCreateAssociationMixin<rate>;
  removeRate!: Sequelize.HasManyRemoveAssociationMixin<rate, rateId>;
  removeRates!: Sequelize.HasManyRemoveAssociationsMixin<rate, rateId>;
  hasRate!: Sequelize.HasManyHasAssociationMixin<rate, rateId>;
  hasRates!: Sequelize.HasManyHasAssociationsMixin<rate, rateId>;
  countRates!: Sequelize.HasManyCountAssociationsMixin;
  // lyric hasMany view via song_id
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
  // lyric belongsTo user via posted_by
  posted_by_user!: user;
  getPosted_by_user!: Sequelize.BelongsToGetAssociationMixin<user>;
  setPosted_by_user!: Sequelize.BelongsToSetAssociationMixin<user, userId>;
  createPosted_by_user!: Sequelize.BelongsToCreateAssociationMixin<user>;

  static initModel(sequelize: Sequelize.Sequelize): typeof lyric {
    return lyric.init({
    id: {
      type: DataTypes.STRING(50),
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(250),
      allowNull: false
    },
    lyrics_text: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    genre: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    sample_uri: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    bpm: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    key: {
      type: DataTypes.STRING(10),
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
    posted_by: {
      type: DataTypes.STRING(50),
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    fork_of: {
      type: DataTypes.STRING(50),
      allowNull: true,
      references: {
        model: 'lyrics',
        key: 'id'
      }
    },
    creation_date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    last_modified: {
      type: DataTypes.DATE,
      allowNull: false
    },
    album_id: {
      type: DataTypes.STRING(50),
      allowNull: true,
      references: {
        model: 'albums',
        key: 'id'
      }
    }
  }, {
    sequelize,
    tableName: 'lyrics',
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
        name: "artist_id",
        using: "BTREE",
        fields: [
          { name: "artist_id" },
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
        name: "fork_of",
        using: "BTREE",
        fields: [
          { name: "fork_of" },
        ]
      },
      {
        name: "album_id",
        using: "BTREE",
        fields: [
          { name: "album_id" },
        ]
      },
    ]
  });
  }
}
