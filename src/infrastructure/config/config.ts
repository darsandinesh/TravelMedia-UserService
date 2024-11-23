import dotenv from 'dotenv';
dotenv.config();

const config = {
    port: parseInt(process.env.PORT as string) || 4001,
    grpcPort: parseInt(process.env.GRPC_PORT as string) || 44001,
    dbURI: process.env.DB_URI || 'mongodb://0.0.0.0:27017/TravelMedia-UserService',
    rabbitMq_url: process.env.RABBITMQ_URL || 'amqp://localhost:5672',
    EMAIL: process.env.SMTP_MAIL,
    EMAIL_PASS: process.env.SMTP_PASSWORD,
    bucketAccessKey: process.env.S3_ACCESS_KEY,
    bucketAccessPassword: process.env.S3_SECRET_ACCESS_KEY,
    bucketName: process.env.S3_BUCKETNAME,
    bucketRegion: process.env.S3_BUCKET_REGION
}

export default config