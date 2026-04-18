import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface payment_methodAttributes {
  id: string;
  name: string;
  description?: string;
  created_by: string;
  creation_date: Date;
}

export type payment_methodPk = "id";
export type payment_methodId = payment_method[payment_methodPk];
export type payment_methodOptionalAttributes = "description";
export type payment_methodCreationAttributes = Optional<payment_methodAttributes, payment_methodOptionalAttributes>;

export class payment_method extends Model<payment_methodAttributes, payment_methodCreationAttributes> implements payment_methodAttributes {
  id!: string;
  name!: string;
  description?: string;
  created_by!: string;
  creation_date!: Date;


  static initModel(sequelize: Sequelize.Sequelize): typeof payment_method {
    return payment_method.init({
    id: {
      type: DataTypes.STRING(50),
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(30),
      allowNull: false
    },
    description: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    created_by: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    creation_date: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'payment_methods',
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
