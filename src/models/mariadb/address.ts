import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { order, orderId } from './order';

export interface addressAttributes {
  id: string;
  email: string;
  address_line?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  additional_info?: string;
}

export type addressPk = "id";
export type addressId = address[addressPk];
export type addressOptionalAttributes = "address_line" | "city" | "state" | "postal_code" | "additional_info";
export type addressCreationAttributes = Optional<addressAttributes, addressOptionalAttributes>;

export class address extends Model<addressAttributes, addressCreationAttributes> implements addressAttributes {
  id!: string;
  email!: string;
  address_line?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  additional_info?: string;

  // address hasMany order via shipping_address_id
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

  static initModel(sequelize: Sequelize.Sequelize): typeof address {
    return address.init({
    id: {
      type: DataTypes.STRING(50),
      allowNull: false,
      primaryKey: true
    },
    email: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    address_line: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    state: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    postal_code: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    additional_info: {
      type: DataTypes.STRING(400),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'addresses',
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
