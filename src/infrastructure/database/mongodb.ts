import mongoose from "mongoose";
import config from '../config/config'

export const databaseConnection = async () => {
    try {
        await mongoose.connect(config.dbURI);
        console.log('database connected');
    } catch (error) {
        console.log('error connection in mongodb --> ', error)
    }
}