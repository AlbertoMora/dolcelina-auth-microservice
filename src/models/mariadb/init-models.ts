import type { Sequelize } from "sequelize";
import { album as _album } from "./album";
import type { albumAttributes, albumCreationAttributes } from "./album";
import { artist as _artist } from "./artist";
import type { artistAttributes, artistCreationAttributes } from "./artist";
import { ban_case as _ban_case } from "./ban_case";
import type { ban_caseAttributes, ban_caseCreationAttributes } from "./ban_case";
import { device as _device } from "./device";
import type { deviceAttributes, deviceCreationAttributes } from "./device";
import { lyric as _lyric } from "./lyric";
import type { lyricAttributes, lyricCreationAttributes } from "./lyric";
import { media_x_ban_case as _media_x_ban_case } from "./media_x_ban_case";
import type { media_x_ban_caseAttributes, media_x_ban_caseCreationAttributes } from "./media_x_ban_case";
import { mfa as _mfa } from "./mfa";
import type { mfaAttributes, mfaCreationAttributes } from "./mfa";
import { mfa_x_user as _mfa_x_user } from "./mfa_x_user";
import type { mfa_x_userAttributes, mfa_x_userCreationAttributes } from "./mfa_x_user";
import { rate as _rate } from "./rate";
import type { rateAttributes, rateCreationAttributes } from "./rate";
import { user as _user } from "./user";
import type { userAttributes, userCreationAttributes } from "./user";
import { view as _view } from "./view";
import type { viewAttributes, viewCreationAttributes } from "./view";

export {
  _album as album,
  _artist as artist,
  _ban_case as ban_case,
  _device as device,
  _lyric as lyric,
  _media_x_ban_case as media_x_ban_case,
  _mfa as mfa,
  _mfa_x_user as mfa_x_user,
  _rate as rate,
  _user as user,
  _view as view,
};

export type {
  albumAttributes,
  albumCreationAttributes,
  artistAttributes,
  artistCreationAttributes,
  ban_caseAttributes,
  ban_caseCreationAttributes,
  deviceAttributes,
  deviceCreationAttributes,
  lyricAttributes,
  lyricCreationAttributes,
  media_x_ban_caseAttributes,
  media_x_ban_caseCreationAttributes,
  mfaAttributes,
  mfaCreationAttributes,
  mfa_x_userAttributes,
  mfa_x_userCreationAttributes,
  rateAttributes,
  rateCreationAttributes,
  userAttributes,
  userCreationAttributes,
  viewAttributes,
  viewCreationAttributes,
};

export function initModels(sequelize: Sequelize) {
  const album = _album.initModel(sequelize);
  const artist = _artist.initModel(sequelize);
  const ban_case = _ban_case.initModel(sequelize);
  const device = _device.initModel(sequelize);
  const lyric = _lyric.initModel(sequelize);
  const media_x_ban_case = _media_x_ban_case.initModel(sequelize);
  const mfa = _mfa.initModel(sequelize);
  const mfa_x_user = _mfa_x_user.initModel(sequelize);
  const rate = _rate.initModel(sequelize);
  const user = _user.initModel(sequelize);
  const view = _view.initModel(sequelize);

  lyric.belongsTo(album, { as: "album", foreignKey: "album_id"});
  album.hasMany(lyric, { as: "lyrics", foreignKey: "album_id"});
  album.belongsTo(artist, { as: "artist", foreignKey: "artist_id"});
  artist.hasMany(album, { as: "albums", foreignKey: "artist_id"});
  lyric.belongsTo(artist, { as: "artist", foreignKey: "artist_id"});
  artist.hasMany(lyric, { as: "lyrics", foreignKey: "artist_id"});
  view.belongsTo(artist, { as: "artist", foreignKey: "artist_id"});
  artist.hasMany(view, { as: "views", foreignKey: "artist_id"});
  media_x_ban_case.belongsTo(ban_case, { as: "ban_case", foreignKey: "ban_case_id"});
  ban_case.hasMany(media_x_ban_case, { as: "media_x_ban_cases", foreignKey: "ban_case_id"});
  mfa_x_user.belongsTo(device, { as: "device", foreignKey: "device_id"});
  device.hasMany(mfa_x_user, { as: "mfa_x_users", foreignKey: "device_id"});
  lyric.belongsTo(lyric, { as: "fork_of_lyric", foreignKey: "fork_of"});
  lyric.hasMany(lyric, { as: "lyrics", foreignKey: "fork_of"});
  rate.belongsTo(lyric, { as: "lyric", foreignKey: "lyrics_id"});
  lyric.hasMany(rate, { as: "rates", foreignKey: "lyrics_id"});
  view.belongsTo(lyric, { as: "song", foreignKey: "song_id"});
  lyric.hasMany(view, { as: "views", foreignKey: "song_id"});
  mfa_x_user.belongsTo(mfa, { as: "mfa", foreignKey: "mfa_id"});
  mfa.hasMany(mfa_x_user, { as: "mfa_x_users", foreignKey: "mfa_id"});
  album.belongsTo(user, { as: "posted_by_user", foreignKey: "posted_by"});
  user.hasMany(album, { as: "albums", foreignKey: "posted_by"});
  artist.belongsTo(user, { as: "posted_by_user", foreignKey: "posted_by"});
  user.hasMany(artist, { as: "artists", foreignKey: "posted_by"});
  ban_case.belongsTo(user, { as: "banned_player", foreignKey: "banned_player_id"});
  user.hasMany(ban_case, { as: "ban_cases", foreignKey: "banned_player_id"});
  ban_case.belongsTo(user, { as: "reported_by_player", foreignKey: "reported_by_player_id"});
  user.hasMany(ban_case, { as: "reported_by_player_ban_cases", foreignKey: "reported_by_player_id"});
  lyric.belongsTo(user, { as: "posted_by_user", foreignKey: "posted_by"});
  user.hasMany(lyric, { as: "lyrics", foreignKey: "posted_by"});
  mfa_x_user.belongsTo(user, { as: "user", foreignKey: "user_id"});
  user.hasMany(mfa_x_user, { as: "mfa_x_users", foreignKey: "user_id"});
  rate.belongsTo(user, { as: "user", foreignKey: "user_id"});
  user.hasMany(rate, { as: "rates", foreignKey: "user_id"});

  return {
    album: album,
    artist: artist,
    ban_case: ban_case,
    device: device,
    lyric: lyric,
    media_x_ban_case: media_x_ban_case,
    mfa: mfa,
    mfa_x_user: mfa_x_user,
    rate: rate,
    user: user,
    view: view,
  };
}
