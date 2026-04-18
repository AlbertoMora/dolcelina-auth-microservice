import { Request, Response } from 'express';
import { Op } from 'sequelize';
import {
    avoidNanParseInt,
    httpCodes,
    responseCodes,
    sendClientError,
    sendOkResponse,
    webErrors,
} from '@aure/commons';
import { SequelizeService } from '../services/sequelize-service';
import { UserViewModel } from '../viewmodels/user.viewmodel';
import argon from 'argon2';
import moment from 'moment';

export const getUsersByName = async (
    req: Request<{}, {}, {}, { username: string; page?: string; limit?: string }>,
    res: Response,
) => {
    const { limit, page, username } = req.query;

    const sequelize = await SequelizeService.getInstance();
    const { count, rows } = await sequelize.db.user.findAndCountAll({
        where: username
            ? {
                  username: {
                      [Op.like]: `%${username}%`,
                  },
              }
            : undefined,
        attributes: [
            'id',
            'name',
            'lastname',
            'email',
            'username',
            'prof_pic',
            'is_active',
            ['created_at', 'creation_date'],
        ],
        limit: avoidNanParseInt(limit),
        offset: avoidNanParseInt(page),
    });

    return sendOkResponse({ status: responseCodes.ok, count, users: rows }, res);
};

export const getUserByIdAction = async (req: Request<{ id: string }>, res: Response) => {
    const { id } = req.params;

    const sequelize = await SequelizeService.getInstance();
    const foundUser = await sequelize.db.user.findByPk(id, {
        attributes: [
            'id',
            'name',
            'lastname',
            'email',
            'username',
            'prof_pic',
            'is_active',
            ['created_at', 'creation_date'],
        ],
    });

    if (!foundUser) return sendClientError(webErrors.srv01, res, httpCodes.not_found);

    return sendOkResponse({ status: responseCodes.ok, user: foundUser }, res);
};

export const updateUserAction = async (
    req: Request<{ id: string }, {}, Partial<UserViewModel>, {}>,
    res: Response,
) => {
    const { id } = req.params;
    const {
        name,
        lastname,
        email,
        username,
        password,
        country_code,
        telephone,
        prof_pic,
        is_active,
    } = req.body;

    const sequelize = await SequelizeService.getInstance();
    const foundUser = await sequelize.db.user.findByPk(id);

    if (!foundUser) return sendClientError(webErrors.srv01, res, httpCodes.not_found);

    if (username || email) {
        const repeatedUser = await sequelize.db.user.findOne({
            where: {
                id: {
                    [Op.ne]: id,
                },
                [Op.or]: [{ username }, { email }],
            },
        });

        if (repeatedUser) return sendClientError(webErrors.auth04, res, httpCodes.bad_request);
    }

    const updatePayload: Record<string, unknown> = {
        last_modified: moment().utc().toDate(),
    };

    if (name !== undefined) updatePayload.name = name;
    if (lastname !== undefined) updatePayload.lastname = lastname;
    if (email !== undefined) updatePayload.email = email;
    if (username !== undefined) updatePayload.username = username;
    if (country_code !== undefined) updatePayload.country_code = country_code;
    if (telephone !== undefined) updatePayload.telephone = telephone;
    if (prof_pic !== undefined) updatePayload.prof_pic = prof_pic;
    if (is_active !== undefined) updatePayload.is_active = is_active ? 1 : 0;
    if (password !== undefined) updatePayload.password = await argon.hash(password);

    const updatedUser = await foundUser.update(updatePayload);
    const { password: _, ...userData } = updatedUser.dataValues;

    return sendOkResponse({ status: responseCodes.ok, user: userData }, res);
};

export const deleteUserAction = async (req: Request<{ id: string }>, res: Response) => {
    const { id } = req.params;

    const sequelize = await SequelizeService.getInstance();
    const foundUser = await sequelize.db.user.findByPk(id);

    if (!foundUser) return sendClientError(webErrors.srv01, res, httpCodes.not_found);

    const updatedUser = await foundUser.update({
        is_active: 0,
        last_modified: moment().utc().toDate(),
    });
    const { password: _, ...userData } = updatedUser.dataValues;

    return sendOkResponse({ status: responseCodes.ok, user: userData }, res);
};

export const banUserAction = async (req: Request<{ id: string }>, res: Response) => {
    const { id } = req.params;

    const sequelize = await SequelizeService.getInstance();
    const foundUser = await sequelize.db.user.findByPk(id);

    if (!foundUser) return sendClientError(webErrors.srv01, res, httpCodes.not_found);

    const banCase = await sequelize.db.ban_case.create({
        id: crypto.randomUUID(),
        banned_player_id: id,
        is_player_banned: 1,
        resolution: 'Banned by admin',
    });

    await banCase.save();

    const updatedUser = await foundUser.update({
        is_active: 0,
        last_modified: moment().utc().toDate(),
    });
    const { password: _, ...userData } = updatedUser.dataValues;

    return sendOkResponse({ status: responseCodes.ok, user: userData, banCase }, res);
};
