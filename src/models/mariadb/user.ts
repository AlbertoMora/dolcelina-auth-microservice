import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { ban_case, ban_caseId } from './ban_case';
import type { banner, bannerId } from './banner';
import type { order, orderId } from './order';
import type { product, productId } from './product';
import type { review, reviewId } from './review';

export interface userAttributes {
  id: string;
  username: string;
  name?: string;
  lastname?: string;
  email: string;
  country_code?: number;
  telephone?: number;
  password: string;
  prof_pic?: string;
  is_active: number;
  ban_case_id?: string;
  last_modified?: Date;
  created_at: Date;
  is_admin: number;
  is_superadmin: number;
}

export type userPk = "id";
export type userId = user[userPk];
export type userOptionalAttributes = "name" | "lastname" | "country_code" | "telephone" | "prof_pic" | "is_active" | "ban_case_id" | "last_modified" | "created_at" | "is_admin" | "is_superadmin";
export type userCreationAttributes = Optional<userAttributes, userOptionalAttributes>;

export class user extends Model<userAttributes, userCreationAttributes> implements userAttributes {
  id!: string;
  username!: string;
  name?: string;
  lastname?: string;
  email!: string;
  country_code?: number;
  telephone?: number;
  password!: string;
  prof_pic?: string;
  is_active!: number;
  ban_case_id?: string;
  last_modified?: Date;
  created_at!: Date;
  is_admin!: number;
  is_superadmin!: number;

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
  // user hasMany banner via created_by
  banners!: banner[];
  getBanners!: Sequelize.HasManyGetAssociationsMixin<banner>;
  setBanners!: Sequelize.HasManySetAssociationsMixin<banner, bannerId>;
  addBanner!: Sequelize.HasManyAddAssociationMixin<banner, bannerId>;
  addBanners!: Sequelize.HasManyAddAssociationsMixin<banner, bannerId>;
  createBanner!: Sequelize.HasManyCreateAssociationMixin<banner>;
  removeBanner!: Sequelize.HasManyRemoveAssociationMixin<banner, bannerId>;
  removeBanners!: Sequelize.HasManyRemoveAssociationsMixin<banner, bannerId>;
  hasBanner!: Sequelize.HasManyHasAssociationMixin<banner, bannerId>;
  hasBanners!: Sequelize.HasManyHasAssociationsMixin<banner, bannerId>;
  countBanners!: Sequelize.HasManyCountAssociationsMixin;
  // user hasMany order via user_id
  orders!: order[];
  getOrders!: Sequelize.HasManyGetAssociationsMixin<order>;
  setOrders!: Sequelize.HasManySetAssociationsMixin<order, orderId>;
  addOrder!: Sequelize.HasManyAddAssociationMixin<order, orderId>;
  addOrders!: Sequelize.HasManyAddAssociationsMixin<order, orderId>;
  createOrder!: Sequelize.HasManyCreateAssociationMixin<order>;
  removeOrder!: Sequelize.HasManyRemoveAssociationMixin<order, orderId>;
  removeOrders!: Sequelize.HasManyRemoveAssociationsMixin<order, orderId>;
  hasOrder!: Sequelize.HasManyHasAssociationMixin<order, orderId>;
  hasOrders!: Sequelize.HasManyHasAssociationsMixin<order, orderId>;
  countOrders!: Sequelize.HasManyCountAssociationsMixin;
  // user hasMany product via created_by
  products!: product[];
  getProducts!: Sequelize.HasManyGetAssociationsMixin<product>;
  setProducts!: Sequelize.HasManySetAssociationsMixin<product, productId>;
  addProduct!: Sequelize.HasManyAddAssociationMixin<product, productId>;
  addProducts!: Sequelize.HasManyAddAssociationsMixin<product, productId>;
  createProduct!: Sequelize.HasManyCreateAssociationMixin<product>;
  removeProduct!: Sequelize.HasManyRemoveAssociationMixin<product, productId>;
  removeProducts!: Sequelize.HasManyRemoveAssociationsMixin<product, productId>;
  hasProduct!: Sequelize.HasManyHasAssociationMixin<product, productId>;
  hasProducts!: Sequelize.HasManyHasAssociationsMixin<product, productId>;
  countProducts!: Sequelize.HasManyCountAssociationsMixin;
  // user hasMany review via user_id
  reviews!: review[];
  getReviews!: Sequelize.HasManyGetAssociationsMixin<review>;
  setReviews!: Sequelize.HasManySetAssociationsMixin<review, reviewId>;
  addReview!: Sequelize.HasManyAddAssociationMixin<review, reviewId>;
  addReviews!: Sequelize.HasManyAddAssociationsMixin<review, reviewId>;
  createReview!: Sequelize.HasManyCreateAssociationMixin<review>;
  removeReview!: Sequelize.HasManyRemoveAssociationMixin<review, reviewId>;
  removeReviews!: Sequelize.HasManyRemoveAssociationsMixin<review, reviewId>;
  hasReview!: Sequelize.HasManyHasAssociationMixin<review, reviewId>;
  hasReviews!: Sequelize.HasManyHasAssociationsMixin<review, reviewId>;
  countReviews!: Sequelize.HasManyCountAssociationsMixin;

  static initModel(sequelize: Sequelize.Sequelize): typeof user {
    return user.init({
    id: {
      type: DataTypes.STRING(50),
      allowNull: false,
      primaryKey: true
    },
    username: {
      type: DataTypes.STRING(30),
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    lastname: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    email: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    country_code: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    telephone: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    prof_pic: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 1
    },
    ban_case_id: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    last_modified: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.Sequelize.fn('current_timestamp')
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('current_timestamp')
    },
    is_admin: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 0
    },
    is_superadmin: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 0
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
    ]
  });
  }
}
