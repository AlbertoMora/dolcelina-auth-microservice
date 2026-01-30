import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { avoidNanParseInt, responseCodes, sendOkResponse } from '@aure/commons';
import { SequelizeService } from '../services/sequelize-service';

export const getUsersByName = async (
    req: Request<{}, {}, {}, { username: string; page?: string; limit?: string }>,
    res: Response
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
            'isactive',
            'creation_date',
        ],
        limit: avoidNanParseInt(limit),
        offset: avoidNanParseInt(page),
    });

    return sendOkResponse({ status: responseCodes.ok, count, users: rows }, res);
};
