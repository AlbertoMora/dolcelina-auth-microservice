import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { product, productId } from './product';
import type { user, userId } from './user';

export interface reviewAttributes {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  comment?: string;
  created_at?: Date;
}

export type reviewPk = "id";
export type reviewId = review[reviewPk];
export type reviewOptionalAttributes = "comment" | "created_at";
export type reviewCreationAttributes = Optional<reviewAttributes, reviewOptionalAttributes>;

export class review extends Model<reviewAttributes, reviewCreationAttributes> implements reviewAttributes {
  id!: string;
  product_id!: string;
  user_id!: string;
  rating!: number;
  comment?: string;
  created_at?: Date;

  // review belongsTo product via product_id
  product!: product;
  getProduct!: Sequelize.BelongsToGetAssociationMixin<product>;
  setProduct!: Sequelize.BelongsToSetAssociationMixin<product, productId>;
  createProduct!: Sequelize.BelongsToCreateAssociationMixin<product>;
  // review belongsTo user via user_id
  user!: user;
  getUser!: Sequelize.BelongsToGetAssociationMixin<user>;
  setUser!: Sequelize.BelongsToSetAssociationMixin<user, userId>;
  createUser!: Sequelize.BelongsToCreateAssociationMixin<user>;

  static initModel(sequelize: Sequelize.Sequelize): typeof review {
    return review.init({
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
    user_id: {
      type: DataTypes.STRING(50),
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    comment: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'reviews',
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
        name: "review_user",
        using: "BTREE",
        fields: [
          { name: "user_id" },
        ]
      },
      {
        name: "review_product",
        using: "BTREE",
        fields: [
          { name: "product_id" },
        ]
      },
    ]
  });
  }
}
