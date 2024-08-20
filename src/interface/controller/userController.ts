import { UserService } from "../../application/use-case/user";

class UserController {

    private userService: UserService;

    constructor() {
        this.userService = new UserService();
    }

    async registerUser(data: any) {
        try {

            const result = await this.userService.registerUser(data);
            return result;

        } catch (error) {
            console.log('error in the registerUser userController -->', error);
        }
    }

    async saveUser(data: any) {
        try {

            const userData = await this.userService.save(data);
            return userData

        } catch (error) {
            console.log('error in the saveUser userController --> ', error);
        }
    }

    async loginUser(data: any) {
        try {
            console.log(data, '---------------------------');
            const result = await this.userService.loginUser(data);
            console.log('loginuser-----------------usercontroleler',result)
            return result;
        } catch (error) {
            console.log('error in the registerUser userController -->', error);
        }
    }

    async verifyEmail(data: any) {
        try {
            console.log(data);
            const result = await this.userService.verifyEmail(data.email);
            return result;
            // const user_data = {
            //     email: data.email,
            //     otp: '1234'
            // }
            // return { success: true, message: 'Otp is send to the Email', user_data }
        } catch (error) {
            console.log('error in the verifyEmail -->', error);
        }
    }

    async resetPassword(data: any) {
        try {
            console.log(data);
            const result = await this.userService.resetPassword(data.email, data.newPassword);
            return result;
        } catch (error) {

        }
    }

    async loginWithGoogle(data: any) {
        try {
            console.log(data);
            const result = await this.userService.loginWithGoogle(data);
            return result;
        } catch (error) {
            console.log('error in the loginwithgoogle userController -->', error);
        }
    }

}

export const userController = new UserController();


//-----------------------------------------------------------------------------------------------------------------------------------------