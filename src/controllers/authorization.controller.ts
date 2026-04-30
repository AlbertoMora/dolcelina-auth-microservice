import { responseCodes, sendOkResponse } from '@amora95/commons';

export const checkPermissionAction = async (req: any, res: any) => {
    const { userId, permission } = req.body;

    sendOkResponse({ status: responseCodes.ok }, res);
};
