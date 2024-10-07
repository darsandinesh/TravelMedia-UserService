import { PassThrough } from "stream";
import { AdminController } from "../../interface/controller/adminController";
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
            case 'resend_otp':
                console.log('Handling operation :', operation);
                response = await userController.resendOtp(data);
                break;
            case 'save_user':
                console.log('Handling user save');
                response = await userController.saveUser(data);
                break;
            case 'user_login':
                console.log('Handling operation :', operation);
                response = await userController.loginUser(data);
                break;
            case 'verify_Email':
                console.log('Handling operation : ', operation);
                response = await userController.verifyEmail(data);
                break;
            case 'reset_password':
                console.log('Handling operation :', operation);
                response = await userController.resetPassword(data);
                break;
            case 'google_login':
                console.log('Handling operation :', operation);
                response = await userController.loginWithGoogle(data);
                break;
            case 'get-user-deatils-for-post':
                console.log('Handling operation : ', operation);
                console.log(data);
                response = await userController.fetchDataForPost(data);
                break;
            case 'get-userProfile':
                console.log('Handling operation : ', operation);
                response = await userController.getUserProfiler(data);
                break;
            case 'update-UserData':
                console.log('Handling operation', operation);
                response = await userController.updateUserProfile(data);
                break;
            case 'changeVisibility':
                console.log('Handling operation',operation);
                response = await userController.changeVisibility(data);
                break;
            case 'search_user':
                console.log('Handling operation', operation);
                response = await userController.searchUser(data);
                break;

            // follow and unfollow user
            case 'folloUser':
                console.log('Handling operaion ', operation);
                response = await userController.followUser(data);
                break;
            case 'unfolloUser':
                console.log('Handling operaion ', operation);
                response = await userController.unfollowUser(data);
                break;

            case 'getFriends':
                console.log('Handling operation ', operation);
                response = await userController.getFriends(data);
                break;
            // admin side code 
            case 'admin_login':
                console.log('Handling operation', operation);
                response = await AdminController.login(data)
                break;
            case 'user_list':
                console.log('Handling operation :', operation);
                response = await AdminController.userList();
                break;
            case 'change_status':
                console.log('Handling operation :', operation);
                response = await AdminController.changeStatus(data);
                break;
            case 'get-user-deatils-for-post':
                console.log('Handling operation : ', operation);
                response = await userController.fetchDataForPost(data);
                break;
            case 'getNewUsers':
                console.log('Handling operation : ', operation);
                response = await AdminController.getNewUsers()
                break;
            case 'getTotalUsers':
                console.log('Handling operation : ', operation);
                response = await AdminController.getTotalUsers()
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