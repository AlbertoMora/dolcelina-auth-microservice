import { Express } from 'express';
import authRoutes from '../routes/authentication.routes';
import authorizationRoutes from '../routes/authorization.routes';
import usersRoutes from '../routes/users.routes';
import oauthRoutes from '../routes/oauth.routes';

export const setRoutesConfig = (app: Express) => {
    app.use('/v1/authentication/', authRoutes);
    app.use('/v1/oauth/', oauthRoutes);
    app.use('/v1/authorization/', authorizationRoutes);
    app.use('/v1/users/', usersRoutes);
};
