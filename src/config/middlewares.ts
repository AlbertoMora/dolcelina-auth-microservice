import morgan from 'morgan';
import cors from 'cors';
import { Express } from 'express';

export const setMiddlewares = (app: Express, express: any) => {
    //middlewares
    app.use(morgan('dev'));
    app.use(express.urlencoded({ extended: false }));
    app.use(express.json());
    app.use(cors());
};
