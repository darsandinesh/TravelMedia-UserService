import { Channel } from 'amqplib';

export default class Producer {
    constructor(private channel: Channel) {}

    async produceMessage(data: any, correlationId: string, replyToQueue: string) {
        try {
            console.log('Producing message with correlationId:', correlationId);
            this.channel.sendToQueue(replyToQueue, Buffer.from(JSON.stringify(data)), {
                correlationId: correlationId
            });
            console.log('Message sent to queue:', replyToQueue);
        } catch (error) {
            console.error('Error producing message:', error);
        }
    }
}

//---------------------------------------------------------------------------------------------------------------------------------