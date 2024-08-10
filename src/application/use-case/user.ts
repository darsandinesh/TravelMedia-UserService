import { IUser } from "../../domain/entities/IUser";
import { UserRepository } from "../../domain/repositories/userRepository";
import { generateOtp } from "../../utils/generateOTP";
import { sendOtpEmail } from "../../utils/emialVerification";
import config from "../../infrastructure/config/config";

export class UserServie {

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
            return { success: true, message: 'Account created successfully', user_data: result };
        } catch (error) {

        }
    }

}

