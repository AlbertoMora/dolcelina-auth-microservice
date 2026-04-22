const modelModules = [
    ['address', require('../../../../dist/models/mariadb/address').address],
    ['ban_case', require('../../../../dist/models/mariadb/ban_case').ban_case],
    ['banner', require('../../../../dist/models/mariadb/banner').banner],
    ['category', require('../../../../dist/models/mariadb/category').category],
    ['order_item', require('../../../../dist/models/mariadb/order_item').order_item],
    ['order', require('../../../../dist/models/mariadb/order').order],
    ['payment_method', require('../../../../dist/models/mariadb/payment_method').payment_method],
    ['product_image', require('../../../../dist/models/mariadb/product_image').product_image],
    ['product', require('../../../../dist/models/mariadb/product').product],
    ['review', require('../../../../dist/models/mariadb/review').review],
    ['user', require('../../../../dist/models/mariadb/user').user],
];

const { initModels } = require('../../../../dist/models/mariadb/init-models');

describe('mariadb model initialization', () => {
    beforeEach(() => {
        jest.restoreAllMocks();
    });

    it.each(modelModules)('%s.initModel initializes the sequelize model', (_, ModelClass) => {
        const initSpy = jest.spyOn(ModelClass, 'init').mockReturnValue(ModelClass);

        expect(ModelClass.initModel({})).toBe(ModelClass);
        expect(initSpy).toHaveBeenCalled();
    });

    it('initModels initializes all models and associations', () => {
        const sequelize = { tag: 'sequelize-instance' };
        const models = {};

        for (const [name, ModelClass] of modelModules) {
            models[name] = {
                name,
                belongsTo: jest.fn(),
                hasMany: jest.fn(),
            };
            jest.spyOn(ModelClass, 'initModel').mockReturnValue(models[name]);
        }

        const initialized = initModels(sequelize);

        expect(initialized).toEqual(models);
        for (const [, ModelClass] of modelModules) {
            expect(ModelClass.initModel).toHaveBeenCalledWith(sequelize);
        }
        expect(models.order.belongsTo).toHaveBeenCalledTimes(1);
        expect(models.address.hasMany).toHaveBeenCalledTimes(1);
        expect(models.product.belongsTo).toHaveBeenCalledTimes(1);
        expect(models.category.hasMany).toHaveBeenCalledTimes(1);
        expect(models.order_item.belongsTo).toHaveBeenCalledTimes(2);
        expect(models.order.hasMany).toHaveBeenCalledTimes(1);
        expect(models.product.hasMany).toHaveBeenCalledTimes(2);
        expect(models.review.belongsTo).toHaveBeenCalledTimes(2);
        expect(models.ban_case.belongsTo).toHaveBeenCalledTimes(2);
        expect(models.user.hasMany).toHaveBeenCalledTimes(3);
    });
});
