import { Channel, connect, Connection, ConsumeMessage } from 'amqplib';
import MessageHandlers from './messageHandlers';
import rabbitMqConfig from '../config/rabbmitMQ';

export default class Consumer {
    constructor(private channel: Channel) { }

    async consumeMessage() {
        try {
            await this.channel.assertQueue(rabbitMqConfig.rabbitMQ.queues.userQueue, { durable: true });
            

            this.channel.consume(rabbitMqConfig.rabbitMQ.queues.userQueue, async (message: ConsumeMessage | null) => {
                if (message) {

                    const { correlationId, replyTo } = message.properties;
                    const operation = message.properties.headers?.function;
                    console.log('Message properties:', { correlationId, replyTo, operation });

                    if (message.content) {
                        const data = JSON.parse(message.content.toString());
                        
                        try {
                            await MessageHandlers.handle(operation, data, correlationId, replyTo);
                        } catch (handlerError) {
                            console.error('Error in message handler:', handlerError);
                        }
                    }
                }
            }, { noAck: true });
        } catch (error) {
            console.error('Error in consumeMessage:', error);
        }
    }
}

//---------------------------------------------------------------------------------------------------------------------------------