import type { Sequelize } from "sequelize";
import { ban_case as _ban_case } from "./ban_case";
import type { ban_caseAttributes, ban_caseCreationAttributes } from "./ban_case";
import { banner as _banner } from "./banner";
import type { bannerAttributes, bannerCreationAttributes } from "./banner";
import { user as _user } from "./user";
import type { userAttributes, userCreationAttributes } from "./user";

export {
  _ban_case as ban_case,
  _banner as banner,
  _user as user,
};

export type {
  ban_caseAttributes,
  ban_caseCreationAttributes,
  bannerAttributes,
  bannerCreationAttributes,
  userAttributes,
  userCreationAttributes,
};

export function initModels(sequelize: Sequelize) {
  const ban_case = _ban_case.initModel(sequelize);
  const banner = _banner.initModel(sequelize);
  const user = _user.initModel(sequelize);

  ban_case.belongsTo(user, { as: "banned_player", foreignKey: "banned_player_id"});
  user.hasMany(ban_case, { as: "ban_cases", foreignKey: "banned_player_id"});
  ban_case.belongsTo(user, { as: "reported_by_player", foreignKey: "reported_by_player_id"});
  user.hasMany(ban_case, { as: "reported_by_player_ban_cases", foreignKey: "reported_by_player_id"});

  return {
    ban_case: ban_case,
    banner: banner,
    user: user,
  };
}
