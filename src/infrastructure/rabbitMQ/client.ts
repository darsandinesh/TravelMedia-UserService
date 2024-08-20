import { Channel, connect, Connection } from "amqplib";
import rabbitMqConfig from "../config/rabbmitMQ"; // Correct the import path if needed
import Producer from "./producer";
import Consumer from "./consumer";

class RabbitMQClient {
    
    private static instance: RabbitMQClient;
    private connection: Connection | undefined;
    private producerChannel: Channel | undefined;
    private consumerChannel: Channel | undefined;
    private producer: Producer | undefined;
    private consumer: Consumer | undefined;
    private isInitialized = false;

    private constructor() {}

    public static getInstance() {
        if (!this.instance) {
            this.instance = new RabbitMQClient();
        }
        return this.instance;
    }

    async initialize() {
        if (this.isInitialized) {
            return;
        }
        try {
            console.log('Connecting to RabbitMQ...');
            this.connection = await connect(rabbitMqConfig.rabbitMQ.url);
            [this.producerChannel, this.consumerChannel] = await Promise.all([
                this.connection.createChannel(),
                this.connection.createChannel()
            ]);

            await Promise.all([
                this.producerChannel.assertQueue(rabbitMqConfig.rabbitMQ.queues.userQueue, { durable: true }),
                this.consumerChannel.assertQueue(rabbitMqConfig.rabbitMQ.queues.userQueue, { durable: true })
            ]);

            this.producer = new Producer(this.producerChannel); // Initialize Producer
            this.consumer = new Consumer(this.consumerChannel);

            console.log('Starting to consume messages...');
            await this.consumer.consumeMessage();

            console.log('RabbitMQ connected successfully');
            this.isInitialized = true;
        } catch (error) {
            console.log('RabbitMQ error -->', error);
        }
    }

    async produce(data: any, correlationId: string, replyToQueue: string) {
        console.log('Producer function is triggered');
        if (!this.isInitialized) {
            await this.initialize();
        }
        console.log('Producer is initialized, sending message...');
        return this.producer?.produceMessage(data, correlationId, replyToQueue);
    }
}

export default RabbitMQClient.getInstance();

//---------------------------------------------------------------------------------------------------------------------------------