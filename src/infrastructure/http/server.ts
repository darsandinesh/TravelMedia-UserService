import express from 'express';
import { databaseConnection } from '../database/mongodb';
import rabbitMQClient from '../rabbitMQ/client'
import config from '../config/config';

const app = express();
app.use(express.json());

const startServer = async () => {
    try {
        await databaseConnection();
        rabbitMQClient.initialize();
        const port = config.port;

        app.listen(port, () => {
            console.log(`userService running on port ${port}`);
        })

    } catch (error) {
        console.log('error in server.ts --> ', error);
    }
}

startServer()
