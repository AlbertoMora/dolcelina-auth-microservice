import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { address, addressId } from './address';
import type { order_item, order_itemId } from './order_item';

export interface orderAttributes {
  id: string;
  email?: string;
  total: number;
  status: string;
  payment_method?: string;
  shipping_address_id?: string;
  created_at?: Date;
  last_modified?: Date;
}

export type orderPk = "id";
export type orderId = order[orderPk];
export type orderOptionalAttributes = "email" | "payment_method" | "shipping_address_id" | "created_at" | "last_modified";
export type orderCreationAttributes = Optional<orderAttributes, orderOptionalAttributes>;

export class order extends Model<orderAttributes, orderCreationAttributes> implements orderAttributes {
  id!: string;
  email?: string;
  total!: number;
  status!: string;
  payment_method?: string;
  shipping_address_id?: string;
  created_at?: Date;
  last_modified?: Date;

  // order belongsTo address via shipping_address_id
  shipping_address!: address;
  getShipping_address!: Sequelize.BelongsToGetAssociationMixin<address>;
  setShipping_address!: Sequelize.BelongsToSetAssociationMixin<address, addressId>;
  createShipping_address!: Sequelize.BelongsToCreateAssociationMixin<address>;
  // order hasMany order_item via order_id
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

  static initModel(sequelize: Sequelize.Sequelize): typeof order {
    return order.init({
    id: {
      type: DataTypes.STRING(50),
      allowNull: false,
      primaryKey: true
    },
    email: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    total: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    status: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    payment_method: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    shipping_address_id: {
      type: DataTypes.STRING(50),
      allowNull: true,
      references: {
        model: 'addresses',
        key: 'id'
      }
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    last_modified: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'orders',
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
        name: "order_address",
        using: "BTREE",
        fields: [
          { name: "shipping_address_id" },
        ]
      },
    ]
  });
  }
}
