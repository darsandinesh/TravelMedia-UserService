import dotenv from 'dotenv';
dotenv.config();

const config = {
    port: parseInt(process.env.PORT as string) || 5001,
    dbURI: process.env.DB_URI || 'mongodb://0.0.0.0:27017/TravelMedia-UserService',
    rabbitMq_url: process.env.RABBITMQ_URL || 'amqp://localhost:5672',
    EMAIL: process.env.SMTP_MAIL,
    EMAIL_PASS: process.env.SMTP_PASSWORD
}

export default config