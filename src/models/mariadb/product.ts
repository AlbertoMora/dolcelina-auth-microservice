import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { category, categoryId } from './category';
import type { order_item, order_itemId } from './order_item';
import type { product_image, product_imageId } from './product_image';
import type { review, reviewId } from './review';
import type { user, userId } from './user';

export interface productAttributes {
  id: string;
  title: string;
  description?: string;
  primary_image_id: string;
  price?: number;
  category_id: string;
  stock?: number;
  servings_per_unit?: number;
  serving_size?: number;
  serving_unit?: string;
  energy?: number;
  carbs?: number;
  sugars?: number;
  diet_fiber?: number;
  added_sugars?: number;
  fat?: number;
  saturated_fat?: number;
  trans_fat?: number;
  cholesterol?: number;
  sodium?: number;
  protein?: number;
  created_by?: string;
  creation_date?: Date;
  last_modified?: Date;
  is_active: boolean;
}

export type productPk = "id";
export type productId = product[productPk];
export type productOptionalAttributes = "description" | "price" | "stock" | "servings_per_unit" | "serving_size" | "serving_unit" | "energy" | "carbs" | "sugars" | "diet_fiber" | "added_sugars" | "fat" | "saturated_fat" | "trans_fat" | "cholesterol" | "sodium" | "protein" | "created_by" | "creation_date" | "last_modified";
export type productCreationAttributes = Optional<productAttributes, productOptionalAttributes>;

export class product extends Model<productAttributes, productCreationAttributes> implements productAttributes {
  id!: string;
  title!: string;
  description?: string;
  primary_image_id!: string;
  price?: number;
  category_id!: string;
  stock?: number;
  servings_per_unit?: number;
  serving_size?: number;
  serving_unit?: string;
  energy?: number;
  carbs?: number;
  sugars?: number;
  diet_fiber?: number;
  added_sugars?: number;
  fat?: number;
  saturated_fat?: number;
  trans_fat?: number;
  cholesterol?: number;
  sodium?: number;
  protein?: number;
  created_by?: string;
  creation_date?: Date;
  last_modified?: Date;
  is_active!: boolean;

  // product belongsTo category via category_id
  category!: category;
  getCategory!: Sequelize.BelongsToGetAssociationMixin<category>;
  setCategory!: Sequelize.BelongsToSetAssociationMixin<category, categoryId>;
  createCategory!: Sequelize.BelongsToCreateAssociationMixin<category>;
  // product hasMany order_item via product_id
  order_items!: order_item[];
  getOrder_items!: Sequelize.HasManyGetAssociationsMixin<order_item>;
  setOrder_items!: Sequelize.HasManySetAssociationsMixin<order_item, order_itemId>;
  addOrder_item!: Sequelize.HasManyAddAssociationMixin<order_item, order_itemId>;
  addOrder_items!: Sequelize.HasManyAddAssociationsMixin<order_item, order_itemId>;
  createOrder_item!: Sequelize.HasManyCreateAssociationMixin<order_item>;
  removeOrder_item!: Sequelize.HasManyRemoveAssociationMixin<order_item, order_itemId>;
  removeOrder_items!: Sequelize.HasManyRemoveAssociationsMixin<order_item, order_itemId>;
  hasOrder_item!: Sequelize.HasManyHasAssociationMixin<order_item, order_itemId>;
  hasOrder_items!: Sequelize.HasManyHasAssociationsMixin<order_item, order_itemId>;
  countOrder_items!: Sequelize.HasManyCountAssociationsMixin;
  // product hasMany product_image via product_id
  product_images!: product_image[];
  getProduct_images!: Sequelize.HasManyGetAssociationsMixin<product_image>;
  setProduct_images!: Sequelize.HasManySetAssociationsMixin<product_image, product_imageId>;
  addProduct_image!: Sequelize.HasManyAddAssociationMixin<product_image, product_imageId>;
  addProduct_images!: Sequelize.HasManyAddAssociationsMixin<product_image, product_imageId>;
  createProduct_image!: Sequelize.HasManyCreateAssociationMixin<product_image>;
  removeProduct_image!: Sequelize.HasManyRemoveAssociationMixin<product_image, product_imageId>;
  removeProduct_images!: Sequelize.HasManyRemoveAssociationsMixin<product_image, product_imageId>;
  hasProduct_image!: Sequelize.HasManyHasAssociationMixin<product_image, product_imageId>;
  hasProduct_images!: Sequelize.HasManyHasAssociationsMixin<product_image, product_imageId>;
  countProduct_images!: Sequelize.HasManyCountAssociationsMixin;
  // product hasMany review via product_id
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
  // product belongsTo user via created_by
  created_by_user!: user;
  getCreated_by_user!: Sequelize.BelongsToGetAssociationMixin<user>;
  setCreated_by_user!: Sequelize.BelongsToSetAssociationMixin<user, userId>;
  createCreated_by_user!: Sequelize.BelongsToCreateAssociationMixin<user>;

  static initModel(sequelize: Sequelize.Sequelize): typeof product {
    return product.init({
    id: {
      type: DataTypes.STRING(50),
      allowNull: false,
      primaryKey: true
    },
    title: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    description: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    primary_image_id: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    category_id: {
      type: DataTypes.STRING(50),
      allowNull: false,
      references: {
        model: 'categories',
        key: 'id'
      }
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    servings_per_unit: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: true
    },
    serving_size: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: true
    },
    serving_unit: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    energy: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    carbs: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    sugars: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    diet_fiber: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    added_sugars: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    fat: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    saturated_fat: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    trans_fat: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    cholesterol: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    sodium: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    protein: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    created_by: {
      type: DataTypes.STRING(50),
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    creation_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    last_modified: {
      type: DataTypes.DATE,
      allowNull: true
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'products',
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
        name: "product_user",
        using: "BTREE",
        fields: [
          { name: "created_by" },
        ]
      },
      {
        name: "product_category",
        using: "BTREE",
        fields: [
          { name: "category_id" },
        ]
      },
    ]
  });
  }
}
