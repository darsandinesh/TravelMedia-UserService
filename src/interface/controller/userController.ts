import { UserServie } from "../../application/use-case/user";

class UserController {

    private userService: UserServie;

    constructor() {
        this.userService = new UserServie();
    }

    async registerUser(data: any) {
        try {
            console.log(data, 'registerUser')
            const result = await this.userService.registerUser(data);
            console.log(result, 'registerUser response')
            return result;
        } catch (error) {
            console.log('error in the registerUser userController -->', error);
        }
    }

    async saveUser(data: any) {
        try {
            console.log(data,'----------------------------------------userController');
            const userData = await this.userService.save(data);
            return userData
        } catch (error) {
            console.log('error in the saveUser userController --> ', error);
        }
    }

}

export const userController = new UserController();


//-----------------------------------------------------------------------------------------------------------------------------------------