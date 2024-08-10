import { userController } from "../../interface/controller/userController";
import rabbitMQClient from './client'

export default class MessageHandlers {
    static async handle(operation: string, data: any, correlationId: string, replyTo: string) {
        let response;

        switch (operation) {
            case 'register_user':
                console.log('Handling operation:', operation);
                response = await userController.registerUser(data);
                break;
            case 'save_user':
                console.log('Handling user save');
                response = await userController.saveUser(data);
                break;
            default:
                response = { error: 'Operation not supported' };
                break;
        }

        console.log('Response in message handler:', response);
        await rabbitMQClient.produce(response, correlationId, replyTo);
    }
}

//----------------------------------------------------------------------------------------------------------------------------------