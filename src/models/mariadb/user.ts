import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

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
}

export type userPk = 'id';
export type userId = user[userPk];
export type userOptionalAttributes =
    | 'name'
    | 'lastname'
    | 'country_code'
    | 'telephone'
    | 'prof_pic'
    | 'is_active'
    | 'ban_case_id'
    | 'last_modified'
    | 'created_at';
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

    static initModel(sequelize: Sequelize.Sequelize): typeof user {
        return user.init(
            {
                id: {
                    type: DataTypes.STRING(50),
                    allowNull: false,
                    primaryKey: true,
                },
                username: {
                    type: DataTypes.STRING(30),
                    allowNull: false,
                },
                name: {
                    type: DataTypes.STRING(100),
                    allowNull: true,
                },
                lastname: {
                    type: DataTypes.STRING(200),
                    allowNull: true,
                },
                email: {
                    type: DataTypes.STRING(200),
                    allowNull: false,
                },
                country_code: {
                    type: DataTypes.INTEGER,
                    allowNull: true,
                },
                telephone: {
                    type: DataTypes.INTEGER,
                    allowNull: true,
                },
                password: {
                    type: DataTypes.STRING(255),
                    allowNull: false,
                },
                prof_pic: {
                    type: DataTypes.STRING(255),
                    allowNull: true,
                },
                is_active: {
                    type: DataTypes.BOOLEAN,
                    allowNull: false,
                    defaultValue: 1,
                },
                ban_case_id: {
                    type: DataTypes.STRING(50),
                    allowNull: true,
                },
                last_modified: {
                    type: DataTypes.DATE,
                    allowNull: true,
                    defaultValue: Sequelize.Sequelize.fn('current_timestamp'),
                },
                created_at: {
                    type: DataTypes.DATE,
                    allowNull: false,
                    defaultValue: Sequelize.Sequelize.fn('current_timestamp'),
                },
            },
            {
                sequelize,
                tableName: 'users',
                timestamps: false,
                indexes: [
                    {
                        name: 'PRIMARY',
                        unique: true,
                        using: 'BTREE',
                        fields: [{ name: 'id' }],
                    },
                ],
            },
        );
    }
}
