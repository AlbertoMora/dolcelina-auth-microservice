import type { Sequelize } from "sequelize";
import { address as _address } from "./address";
import type { addressAttributes, addressCreationAttributes } from "./address";
import { ban_case as _ban_case } from "./ban_case";
import type { ban_caseAttributes, ban_caseCreationAttributes } from "./ban_case";
import { banner as _banner } from "./banner";
import type { bannerAttributes, bannerCreationAttributes } from "./banner";
import { category as _category } from "./category";
import type { categoryAttributes, categoryCreationAttributes } from "./category";
import { order_item as _order_item } from "./order_item";
import type { order_itemAttributes, order_itemCreationAttributes } from "./order_item";
import { order as _order } from "./order";
import type { orderAttributes, orderCreationAttributes } from "./order";
import { payment_method as _payment_method } from "./payment_method";
import type { payment_methodAttributes, payment_methodCreationAttributes } from "./payment_method";
import { product_image as _product_image } from "./product_image";
import type { product_imageAttributes, product_imageCreationAttributes } from "./product_image";
import { product as _product } from "./product";
import type { productAttributes, productCreationAttributes } from "./product";
import { review as _review } from "./review";
import type { reviewAttributes, reviewCreationAttributes } from "./review";
import { user as _user } from "./user";
import type { userAttributes, userCreationAttributes } from "./user";

export {
  _address as address,
  _ban_case as ban_case,
  _banner as banner,
  _category as category,
  _order_item as order_item,
  _order as order,
  _payment_method as payment_method,
  _product_image as product_image,
  _product as product,
  _review as review,
  _user as user,
};

export type {
  addressAttributes,
  addressCreationAttributes,
  ban_caseAttributes,
  ban_caseCreationAttributes,
  bannerAttributes,
  bannerCreationAttributes,
  categoryAttributes,
  categoryCreationAttributes,
  order_itemAttributes,
  order_itemCreationAttributes,
  orderAttributes,
  orderCreationAttributes,
  payment_methodAttributes,
  payment_methodCreationAttributes,
  product_imageAttributes,
  product_imageCreationAttributes,
  productAttributes,
  productCreationAttributes,
  reviewAttributes,
  reviewCreationAttributes,
  userAttributes,
  userCreationAttributes,
};

export function initModels(sequelize: Sequelize) {
  const address = _address.initModel(sequelize);
  const ban_case = _ban_case.initModel(sequelize);
  const banner = _banner.initModel(sequelize);
  const category = _category.initModel(sequelize);
  const order_item = _order_item.initModel(sequelize);
  const order = _order.initModel(sequelize);
  const payment_method = _payment_method.initModel(sequelize);
  const product_image = _product_image.initModel(sequelize);
  const product = _product.initModel(sequelize);
  const review = _review.initModel(sequelize);
  const user = _user.initModel(sequelize);

  order.belongsTo(address, { as: "shipping_address", foreignKey: "shipping_address_id"});
  address.hasMany(order, { as: "orders", foreignKey: "shipping_address_id"});
  product.belongsTo(category, { as: "category", foreignKey: "category_id"});
  category.hasMany(product, { as: "products", foreignKey: "category_id"});
  order_item.belongsTo(order, { as: "order", foreignKey: "order_id"});
  order.hasMany(order_item, { as: "order_items", foreignKey: "order_id"});
  order_item.belongsTo(product, { as: "product", foreignKey: "product_id"});
  product.hasMany(order_item, { as: "order_items", foreignKey: "product_id"});
  review.belongsTo(product, { as: "product", foreignKey: "product_id"});
  product.hasMany(review, { as: "reviews", foreignKey: "product_id"});
  ban_case.belongsTo(user, { as: "banned_player", foreignKey: "banned_player_id"});
  user.hasMany(ban_case, { as: "ban_cases", foreignKey: "banned_player_id"});
  ban_case.belongsTo(user, { as: "reported_by_player", foreignKey: "reported_by_player_id"});
  user.hasMany(ban_case, { as: "reported_by_player_ban_cases", foreignKey: "reported_by_player_id"});
  review.belongsTo(user, { as: "user", foreignKey: "user_id"});
  user.hasMany(review, { as: "reviews", foreignKey: "user_id"});

  return {
    address: address,
    ban_case: ban_case,
    banner: banner,
    category: category,
    order_item: order_item,
    order: order,
    payment_method: payment_method,
    product_image: product_image,
    product: product,
    review: review,
    user: user,
  };
}
