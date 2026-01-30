import { Request, Response } from 'express';
import { fgaClient } from '../config/openfga-config';
import { ICheckPermissionViewModel } from '../viewmodels/check-permission.viewmodel';
import { responseCodes, sendOkResponse } from '@aure/commons';
import { getUserSession } from '../utils/session-helper';

export const checkPermissionAction = async (
    req: Request<any, {}, ICheckPermissionViewModel, {}>,
    res: Response
) => {
    const { relation, objectName, objectId } = req.body;
    const userSession = getUserSession(req.headers.authorization ?? '');

    const isActionAllowed = (
        await checkPermission(userSession.user.id, objectName, objectId, relation)
    ).allowed;

    sendOkResponse(
        {
            status: responseCodes.ok,
            isActionAllowed,
        },
        res
    );
};

export const checkPermission = async (
    userId: string,
    objectName: string,
    objectId: string,
    relation: string
) => {
    const { authorization_model } = await fgaClient.readAuthorizationModel();
    return await fgaClient.check(
        {
            user: `user:${userId}`,
            relation: relation,
            object: `${objectName}:${objectId}`,
        },
        { authorizationModelId: authorization_model?.id }
    );
};
