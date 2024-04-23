import express from 'express';
import cors from 'cors';
import {createConnection} from "typeorm";
import {routes} from "./routes";
import dotenv from 'dotenv';
import {createClient} from "redis";
import run from './kafkaClient';

dotenv.config();

export const client = createClient({
    url: process.env.REDIS_URL
});

createConnection().then(async () => {
    const app = express();

    app.use(express.json());
    app.use(cors());

    app.disable('x-powered-by');

    routes(app);

    const expressPort = process.env.PORT || 10000

    run();
    app.listen(expressPort, () => {
        console.log(`listening to port ${expressPort}`)
    });
});
