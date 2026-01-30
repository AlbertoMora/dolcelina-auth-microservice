import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { album, albumId } from './album';
import type { artist, artistId } from './artist';
import type { ban_case, ban_caseId } from './ban_case';
import type { lyric, lyricId } from './lyric';
import type { mfa_x_user, mfa_x_userId } from './mfa_x_user';
import type { rate, rateId } from './rate';

export interface userAttributes {
  id: string;
  name?: string;
  lastname?: string;
  email: string;
  username: string;
  pass: string;
  prof_pic?: string;
  isactive: number;
  ban_case_id?: string;
  creation_date?: Date;
  last_modified?: Date;
}

export type userPk = "id";
export type userId = user[userPk];
export type userOptionalAttributes = "name" | "lastname" | "prof_pic" | "ban_case_id" | "creation_date" | "last_modified";
export type userCreationAttributes = Optional<userAttributes, userOptionalAttributes>;

export class user extends Model<userAttributes, userCreationAttributes> implements userAttributes {
  id!: string;
  name?: string;
  lastname?: string;
  email!: string;
  username!: string;
  pass!: string;
  prof_pic?: string;
  isactive!: number;
  ban_case_id?: string;
  creation_date?: Date;
  last_modified?: Date;

  // user hasMany album via posted_by
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
  // user hasMany artist via posted_by
  artists!: artist[];
  getArtists!: Sequelize.HasManyGetAssociationsMixin<artist>;
  setArtists!: Sequelize.HasManySetAssociationsMixin<artist, artistId>;
  addArtist!: Sequelize.HasManyAddAssociationMixin<artist, artistId>;
  addArtists!: Sequelize.HasManyAddAssociationsMixin<artist, artistId>;
  createArtist!: Sequelize.HasManyCreateAssociationMixin<artist>;
  removeArtist!: Sequelize.HasManyRemoveAssociationMixin<artist, artistId>;
  removeArtists!: Sequelize.HasManyRemoveAssociationsMixin<artist, artistId>;
  hasArtist!: Sequelize.HasManyHasAssociationMixin<artist, artistId>;
  hasArtists!: Sequelize.HasManyHasAssociationsMixin<artist, artistId>;
  countArtists!: Sequelize.HasManyCountAssociationsMixin;
  // user hasMany ban_case via banned_player_id
  ban_cases!: ban_case[];
  getBan_cases!: Sequelize.HasManyGetAssociationsMixin<ban_case>;
  setBan_cases!: Sequelize.HasManySetAssociationsMixin<ban_case, ban_caseId>;
  addBan_case!: Sequelize.HasManyAddAssociationMixin<ban_case, ban_caseId>;
  addBan_cases!: Sequelize.HasManyAddAssociationsMixin<ban_case, ban_caseId>;
  createBan_case!: Sequelize.HasManyCreateAssociationMixin<ban_case>;
  removeBan_case!: Sequelize.HasManyRemoveAssociationMixin<ban_case, ban_caseId>;
  removeBan_cases!: Sequelize.HasManyRemoveAssociationsMixin<ban_case, ban_caseId>;
  hasBan_case!: Sequelize.HasManyHasAssociationMixin<ban_case, ban_caseId>;
  hasBan_cases!: Sequelize.HasManyHasAssociationsMixin<ban_case, ban_caseId>;
  countBan_cases!: Sequelize.HasManyCountAssociationsMixin;
  // user hasMany ban_case via reported_by_player_id
  reported_by_player_ban_cases!: ban_case[];
  getReported_by_player_ban_cases!: Sequelize.HasManyGetAssociationsMixin<ban_case>;
  setReported_by_player_ban_cases!: Sequelize.HasManySetAssociationsMixin<ban_case, ban_caseId>;
  addReported_by_player_ban_case!: Sequelize.HasManyAddAssociationMixin<ban_case, ban_caseId>;
  addReported_by_player_ban_cases!: Sequelize.HasManyAddAssociationsMixin<ban_case, ban_caseId>;
  createReported_by_player_ban_case!: Sequelize.HasManyCreateAssociationMixin<ban_case>;
  removeReported_by_player_ban_case!: Sequelize.HasManyRemoveAssociationMixin<ban_case, ban_caseId>;
  removeReported_by_player_ban_cases!: Sequelize.HasManyRemoveAssociationsMixin<ban_case, ban_caseId>;
  hasReported_by_player_ban_case!: Sequelize.HasManyHasAssociationMixin<ban_case, ban_caseId>;
  hasReported_by_player_ban_cases!: Sequelize.HasManyHasAssociationsMixin<ban_case, ban_caseId>;
  countReported_by_player_ban_cases!: Sequelize.HasManyCountAssociationsMixin;
  // user hasMany lyric via posted_by
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
  // user hasMany mfa_x_user via user_id
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
  // user hasMany rate via user_id
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

  static initModel(sequelize: Sequelize.Sequelize): typeof user {
    return user.init({
    id: {
      type: DataTypes.STRING(50),
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    lastname: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: "email"
    },
    username: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: "username"
    },
    pass: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    prof_pic: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    isactive: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    ban_case_id: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    creation_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    last_modified: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'users',
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
        name: "email",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "email" },
        ]
      },
      {
        name: "username",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "username" },
        ]
      },
    ]
  });
  }
}
