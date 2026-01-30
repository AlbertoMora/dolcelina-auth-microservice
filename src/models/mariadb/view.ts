import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { artist, artistId } from './artist';
import type { lyric, lyricId } from './lyric';

export interface viewAttributes {
  id: string;
  song_id: string;
  artist_id: string;
}

export type viewPk = "id";
export type viewId = view[viewPk];
export type viewCreationAttributes = viewAttributes;

export class view extends Model<viewAttributes, viewCreationAttributes> implements viewAttributes {
  id!: string;
  song_id!: string;
  artist_id!: string;

  // view belongsTo artist via artist_id
  artist!: artist;
  getArtist!: Sequelize.BelongsToGetAssociationMixin<artist>;
  setArtist!: Sequelize.BelongsToSetAssociationMixin<artist, artistId>;
  createArtist!: Sequelize.BelongsToCreateAssociationMixin<artist>;
  // view belongsTo lyric via song_id
  song!: lyric;
  getSong!: Sequelize.BelongsToGetAssociationMixin<lyric>;
  setSong!: Sequelize.BelongsToSetAssociationMixin<lyric, lyricId>;
  createSong!: Sequelize.BelongsToCreateAssociationMixin<lyric>;

  static initModel(sequelize: Sequelize.Sequelize): typeof view {
    return view.init({
    id: {
      type: DataTypes.STRING(50),
      allowNull: false,
      primaryKey: true
    },
    song_id: {
      type: DataTypes.STRING(50),
      allowNull: false,
      references: {
        model: 'lyrics',
        key: 'id'
      }
    },
    artist_id: {
      type: DataTypes.STRING(50),
      allowNull: false,
      references: {
        model: 'artists',
        key: 'id'
      }
    }
  }, {
    sequelize,
    tableName: 'views',
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
        name: "song_id",
        using: "BTREE",
        fields: [
          { name: "song_id" },
        ]
      },
      {
        name: "artist_id",
        using: "BTREE",
        fields: [
          { name: "artist_id" },
        ]
      },
    ]
  });
  }
}
