import { IUser } from "../../domain/entities/IUser";
import { UserRepository } from "../../domain/repositories/userRepository";
import { generateOtp } from "../../utils/generateOTP";
import { sendOtpEmail } from "../../utils/emialVerification";


interface user {
    email: string,
    password: string
}

export class UserService {

    private userRepo: UserRepository;

    constructor() {
        this.userRepo = new UserRepository();
    }

    async registerUser(userData: IUser): Promise<any> {
        try {
            const existingUser = await this.userRepo.findEmail(userData.email);
            console.log(existingUser, 'user found');

            if (existingUser) {
                return { success: false, message: "Email already exists" };
            } else {
                const otp = generateOtp();
                console.log("this is generated otp", otp);
                console.log(userData)
                await sendOtpEmail(userData.email, otp);

                return { message: "Verify the otp to complete registration", success: true, otp, user_data: userData };
            }

        } catch (error) {

        }
    }

    async save(userData: IUser): Promise<any> {
        try {
            console.log(userData, '------------------------------------------------userService')
            const result = await this.userRepo.saveUser(userData);
            if (result) {
                return { success: true, message: 'Account created successfully', user_data: result };
            }
            else {
                return { success: false, messgea: 'someting went worng try again later' };
            }
        } catch (error) {

        }
    }

    async loginUser(data: user): Promise<any> {
        try {
            console.log(data, '------------------------------loginUser in userService');
            const result = await this.userRepo.checkUser(data.email, data.password);
            return result;
        } catch (error) {

        }
    }

    async verifyEmail(email: string): Promise<any> {
        try {
            const user = await this.userRepo.findEmail(email);
            console.log(user, 'user service in email verification');
            if (user) {
                const otp = generateOtp();
                await sendOtpEmail(email, otp);
                const user_data = {
                    email,
                    otp
                }
                return { success: true, message: 'Otp is send to the Email', user_data };
            } else {
                return { success: false, message: 'No user found, Register first' };
            }
        } catch (error) {

        }
    }

    async resetPassword(email: string, password: string): Promise<any> {
        try {
            let user = await this.userRepo.resetPassword(email, password);
            console.log(user);
            return user;
        } catch (error) {

        }
    }

    async loginWithGoogle(data: any): Promise<any> {
        try {
            const email = data.email;
            const name = data.fullname;
            let user = await this.userRepo.findEmail(email);
            if (!user) {
                user = await this.userRepo.saveUser({
                    email,
                    name,
                    password: 'defaultpassword',
                } as IUser)
            }
            console.log(user.isBlocked);
            if (user.isBlocked) {
                console.log('isblocked----------------if')
                return { success: false, message: 'You have been blocked by the admin', user_data: user };
            } else {
                console.log('isblocked----------------else')
                return { success: true, message: 'Logged in successful', user_data: user };
            }

        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Error logging in with Google: ${error.message}`);
            }
            throw error;
        }
    }

}

