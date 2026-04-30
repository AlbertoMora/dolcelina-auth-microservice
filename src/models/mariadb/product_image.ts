import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { product, productId } from './product';

export interface product_imageAttributes {
  id: string;
  product_id: string;
  image_url: string;
  alt_text?: string;
  created_at?: Date;
}

export type product_imagePk = "id";
export type product_imageId = product_image[product_imagePk];
export type product_imageOptionalAttributes = "alt_text" | "created_at";
export type product_imageCreationAttributes = Optional<product_imageAttributes, product_imageOptionalAttributes>;

export class product_image extends Model<product_imageAttributes, product_imageCreationAttributes> implements product_imageAttributes {
  id!: string;
  product_id!: string;
  image_url!: string;
  alt_text?: string;
  created_at?: Date;

  // product_image belongsTo product via product_id
  product!: product;
  getProduct!: Sequelize.BelongsToGetAssociationMixin<product>;
  setProduct!: Sequelize.BelongsToSetAssociationMixin<product, productId>;
  createProduct!: Sequelize.BelongsToCreateAssociationMixin<product>;

  static initModel(sequelize: Sequelize.Sequelize): typeof product_image {
    return product_image.init({
    id: {
      type: DataTypes.STRING(50),
      allowNull: false,
      primaryKey: true
    },
    product_id: {
      type: DataTypes.STRING(50),
      allowNull: false,
      references: {
        model: 'products',
        key: 'id'
      }
    },
    image_url: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    alt_text: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'product_images',
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
        name: "product_images",
        using: "BTREE",
        fields: [
          { name: "product_id" },
        ]
      },
    ]
  });
  }
}
