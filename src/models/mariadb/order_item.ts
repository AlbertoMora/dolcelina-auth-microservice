import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { order, orderId } from './order';
import type { product, productId } from './product';

export interface order_itemAttributes {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
}

export type order_itemPk = "id";
export type order_itemId = order_item[order_itemPk];
export type order_itemCreationAttributes = order_itemAttributes;

export class order_item extends Model<order_itemAttributes, order_itemCreationAttributes> implements order_itemAttributes {
  id!: string;
  order_id!: string;
  product_id!: string;
  quantity!: number;
  price!: number;

  // order_item belongsTo order via order_id
  order!: order;
  getOrder!: Sequelize.BelongsToGetAssociationMixin<order>;
  setOrder!: Sequelize.BelongsToSetAssociationMixin<order, orderId>;
  createOrder!: Sequelize.BelongsToCreateAssociationMixin<order>;
  // order_item belongsTo product via product_id
  product!: product;
  getProduct!: Sequelize.BelongsToGetAssociationMixin<product>;
  setProduct!: Sequelize.BelongsToSetAssociationMixin<product, productId>;
  createProduct!: Sequelize.BelongsToCreateAssociationMixin<product>;

  static initModel(sequelize: Sequelize.Sequelize): typeof order_item {
    return order_item.init({
    id: {
      type: DataTypes.STRING(50),
      allowNull: false,
      primaryKey: true
    },
    order_id: {
      type: DataTypes.STRING(50),
      allowNull: false,
      references: {
        model: 'orders',
        key: 'id'
      }
    },
    product_id: {
      type: DataTypes.STRING(50),
      allowNull: false,
      references: {
        model: 'products',
        key: 'id'
      }
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'order_items',
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
        name: "order_items_order",
        using: "BTREE",
        fields: [
          { name: "order_id" },
        ]
      },
      {
        name: "order_items_product",
        using: "BTREE",
        fields: [
          { name: "product_id" },
        ]
      },
    ]
  });
  }
}
