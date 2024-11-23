import { UserService } from "../../application/use-case/user";
import { PaymentService } from "../../application/use-case/payment";
import { IUserPostDetails } from "../../domain/entities/IUserDeatils";
import { IUser, UpdateUserProfileData } from "../../domain/entities/IUser";
import * as grpc from '@grpc/grpc-js';

interface user {
    email: string,
    password: string
}

class UserController {

    private userService: UserService;
    private paymentService: PaymentService;

    constructor() {
        this.userService = new UserService();
        this.paymentService = new PaymentService();
    }

    async registerUser(data: IUser) {
        try {

            const result = await this.userService.registerUser(data);
            return result;

        } catch (error) {
            console.log('error in the registerUser userController -->', error);
        }
    }

    async grpcregisterUser(
        call: grpc.ServerUnaryCall<IUser, IUser>,
        callback: grpc.sendUnaryData<{ success: boolean, message: string, otp?: string, user_data?: IUser }>) {
        try {
            await this.userService.grpcregisterUser(call.request, callback)
        } catch (error) {

        }
    }

    async resendOtp(email: string) {
        try {
            const result = await this.userService.resendOtp(email);
            return result
        } catch (error) {
            console.log('error in the resendOtp userController -->', error);
        }
    }

    async saveUser(data: IUser) {
        try {

            const userData = await this.userService.save(data);
            return userData

        } catch (error) {
            console.log('error in the saveUser userController --> ', error);
        }
    }

    async loginUser(
        call: grpc.ServerUnaryCall<user, IUser>,
        callback: grpc.sendUnaryData<{ user_data?: IUser }>) {
        try {
            const { email, password } = call.request;
            console.log(email, password, 'grpc request')
            await this.userService.loginUser({ email, password }, callback)
        } catch (error) {
            console.log('error in the registerUser userController -->', error);
        }
    }

    async verifyEmail(data: { email: string }) {
        try {
            console.log(data);
            const result = await this.userService.verifyEmail(data.email);
            return result;
        } catch (error) {
            console.log('error in the verifyEmail -->', error);
        }
    }

    async resetPassword(data: { email: string, newPassword: string }) {
        try {
            console.log(data);
            const result = await this.userService.resetPassword(data.email, data.newPassword);
            return result;
        } catch (error) {

        }
    }

    async loginWithGoogle(data: { email: string, fullname: string }) {
        try {
            console.log(data);
            const result = await this.userService.loginWithGoogle(data);
            return result;
        } catch (error) {
            console.log('error in the loginwithgoogle userController -->', error);
        }
    }

    async fetchDataForPost(data: { userIds: string[] }): Promise<{ success: boolean; message: string; data?: IUserPostDetails[] }> {
        try {
            console.log('1', data)
            const results = await Promise.all(data.userIds.map(async (userId) => {
                return this.userService.fetchUserDatasForPost(userId);
            }));

            const successfulResult = results.filter(result => result.success).map(result => result.data);

            if (successfulResult.length > 0) {
                return {
                    success: true,
                    message: "data found",
                    data: successfulResult as IUserPostDetails[]
                };
            } else {
                return {
                    success: false,
                    message: 'No data found'
                }
            }
        } catch (error) {

            console.log('error in the fetchDataForPost usercontroller -->', error);
            console.error("Error fetching user data:", error);
            throw new Error("Error occurred while fetching user data");
        }
    }

    async getUserProfiler(id: string) {
        try {
            console.log(id, 'id in the getUserProfiler in the userservice----');
            const result = await this.userService.getUserProfile(id);
            return result
        } catch (error) {
            console.log('error in the fetchDataForPost usercontroller -->', error);
        }
    }

    async updateUserProfile(data: UpdateUserProfileData) {
        try {
            console.log(data);
            const result = await this.userService.updateUserProfile(data);
            console.log(result, '=======')
            return result
        } catch (error) {
            console.log('Error in teh updateUserProfile userControler userService -->', error)
        }
    }

    async changeVisibility(data: { isPrivate: boolean, userId: string }) {
        try {
            console.log(data);
            const result = await this.userService.changeVisibility(data);
            return result;
        } catch (error) {
            console.log('Error in the changeVisibility userControler userService -->', error)
        }
    }

    async searchUser(search: string) {
        try {
            console.log(search);
            const result = await this.userService.searchUser(search);
            console.log(result);
            return result
        } catch (error) {
            console.log('Error in the searchUser usercontroller userService', error);
        }
    }

    async followUser(data: { loggeduser: string, followedId: string }) {
        try {
            console.log(data);
            const result = await this.userService.followUser(data);
            return result;
        } catch (error) {
            console.log('Error in the follow usercontroller ', error);
        }
    }

    async unfollowUser(data: { loggeduser: string, followedId: string }) {
        try {
            console.log(data);
            const result = await this.userService.unfollowUser(data);
            return result;
        } catch (error) {
            console.log('Error in the follow usercontroller ', error);
        }
    }

    async getFriends(userId: string) {
        try {
            console.log(userId, 'id of the user ');
            const result = await this.userService.getFriends(userId);
            return result;
        } catch (error) {
            console.log('Error in the getFriends userController -->', error);
        }
    }

    async savePost(data: { userId: string, postId: string }) {
        try {
            console.log(data.postId, '--------id of the post', data.userId);
            const result = await this.userService.savePost(data);
            return result;
        } catch (error) {
            console.log('Error in savePost in userControler -->', error)
        }
    }

    async membership(id: string) {
        try {
            const result = await this.paymentService.createStripeSession(id);
            return result;
        } catch (error) {

        }
    }

    async savePayment(sessionId: string) {
        try {
            console.log(sessionId);
            const result = await this.paymentService.orderSuccess(sessionId)
            return result;

        } catch (error) {
            console.log('Error in the savePayment in -->', error);
        }
    }


}

export const userController = new UserController();


//-----------------------------------------------------------------------------------------------------------------------------------------