import { Request, Response } from 'express';
import { Op } from 'sequelize';
import {
    avoidNanParseInt,
    dbConstants,
    getTokenData,
    httpCodes,
    responseCodes,
    sendClientError,
    sendOkResponse,
    webErrors,
} from '@amora95/commons';
import { SequelizeService } from '../services/sequelize-service';
import { IUserPasswordUpdateViewModel, UserViewModel } from '../viewmodels/user.viewmodel';
import argon from 'argon2';
import moment from 'moment';
import { getLoginTokens } from './authentication.controller';
import { IUserSession } from '../types/commons.types';

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
            'telephone',
            'prof_pic',
            'is_active',
            'is_admin',
            'is_superadmin',
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
    req: Request<{ id: string }, {}, Omit<UserViewModel, 'password'>, {}>,
    res: Response,
) => {
    const { id } = req.params;
    const { name, lastname, email, username, country_code, telephone, prof_pic, is_active } =
        req.body;

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

export const updatePasswordAction = async (
    req: Request<{}, {}, IUserPasswordUpdateViewModel, {}>,
    res: Response,
) => {
    const token = req.headers.authorization?.split(' ')[1];
    const userInfo = getTokenData<IUserSession>(token ?? '');

    const { oldPassword, password } = req.body;

    const sequelize = await SequelizeService.getInstance();
    const foundUser = await sequelize.db.user.findByPk(userInfo.user.id);

    let isSamePassword = false;

    if (oldPassword) isSamePassword = await argon.verify(foundUser?.password ?? '', oldPassword);
    const hasPassword = foundUser?.password !== dbConstants.status.pending;

    if (!foundUser || !(hasPassword ? isSamePassword : true))
        return sendClientError(webErrors.auth03, res, httpCodes.bad_request);

    const hashedPassword = await argon.hash(password);
    await foundUser.update({ password: hashedPassword, last_modified: moment().utc().toDate() });

    const { accessToken, refreshToken } = await getLoginTokens(foundUser, userInfo.sessionId);

    return sendOkResponse({ status: responseCodes.ok, accessToken, refreshToken }, res);
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

export const toggleAdminAction = async (req: Request<{ id: string }>, res: Response) => {
    const { id } = req.params;

    const sequelize = await SequelizeService.getInstance();
    const foundUser = await sequelize.db.user.findByPk(id);

    if (!foundUser) return sendClientError(webErrors.srv01, res, httpCodes.not_found);

    const updatedUser = await foundUser.update({
        is_admin: foundUser.is_admin ? 0 : 1,
        last_modified: moment().utc().toDate(),
    });

    await updatedUser.save();

    const { password: _, ...userData } = updatedUser.dataValues;
    return sendOkResponse({ status: responseCodes.ok, user: userData }, res);
};
