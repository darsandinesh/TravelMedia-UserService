import { IUser } from "../../domain/entities/IUser";
import { UserRepository } from "../../domain/repositories/userRepository";
import { generateOtp } from "../../utils/generateOTP";
import { sendOtpEmail } from "../../utils/emialVerification";
import { IUserDetails, IUserPostDetails } from "../../domain/entities/IUserDeatils";
import { fetchFileFromS3, uploadFileToS3 } from "../../infrastructure/s3/s3Actions";


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

    async resendOtp(email: string): Promise<any> {
        try {
            console.log('resentotp in application use-case');
            const otp = generateOtp();
            await sendOtpEmail(email, otp);
            return { message: 'otp resend successful', success: true, otp }
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

    async fetchUserDatasForPost(userId: string): Promise<{ success: boolean; message: string; data?: IUserPostDetails }> {
        try {
            console.log('2')
            const result = await this.userRepo.findUserDetailsForPost(userId);
            if (!result || !result.data) {
                return { success: false, message: "No data foudn" };
            }
            console.log(result, 'hia hello')
            return { success: true, message: "Data found", data: { id: result.data.id, name: result.data.name, avatar: result.data.avatar } };
        } catch (error) {
            console.error("Error fetching user data for post:", error);
            throw new Error("Error occurred while fetching user data for post");
        }
    }

    async getUserProfile(userId: string): Promise<{ success: boolean; message: string; data?: IUser }> {
        try {
            const userExist = await this.userRepo.getUserProfile(userId)
            console.log(userExist);
            if (!userExist) {
                return { success: false, message: "Unable to find the user data" }
            }
            return { success: true, message: 'user data found successs', data: userExist }
        } catch (error) {
            console.log("Error fetching user data for profile : ", error);
            throw new Error("Error fetching user data for profile")
        }
    }

    async updateUserProfile(data: any): Promise<{ success: boolean; message: string; avatarUrl?: string }> {
        try {
            console.log(data, 'data in application user.ts');
            let profile_pic: string = ''
            if (data.image) {
                const buffer = Buffer.isBuffer(data.image.buffer) ? data.image.buffer : Buffer.from(data.image.buffer);
                const key = await uploadFileToS3(buffer, data.image.originalname);
                profile_pic = await fetchFileFromS3(key, 604800);
            }
            console.log(profile_pic, '------------------')
            data.image = profile_pic
            const updateUser = await this.userRepo.updateUserProfile(data);
            console.log(updateUser, '-----------')
            if (!updateUser) {
                console.log('if')
                return { success: false, message: 'Profile is uptoDate' }
            }
            console.log('outside if')
            return { success: true, message: 'updated success', avatarUrl: profile_pic };
        } catch (error) {
            console.log('Error in updateUserProfile in application user userService');
            return { success: false, message: 'internal server error' };
        }
    }


    async changeVisibility(data: { isPrivate: boolean, userId: string }) {
        try {
            const result: any = await this.userRepo.changeVisibility(data);
            console.log(result);
            if (result?.modifiedCount == 0) {
                return { success: false, message: 'Unable to change the status' };
            }
            return { success: true, message: 'Account status changed' }
        } catch (error) {
            console.log('Error in updateUserProfile in application user userService');
            return { success: false, message: 'internal server error' };
        }
    }

    async searchUser(search: string) {
        try {
            console.log(search, '-----------applicaiton usercase for search user')
            const userData = await this.userRepo.findUsers(search);
            console.log(userData);
            if (!userData) {
                return { success: false, message: 'No user found' }
            }
            return { success: true, message: 'userData found', data: userData }
        } catch (error) {
            console.log('Error in searchUser in application user userService');
            return { success: false, message: 'Someting went wrong' }
        }
    }

    async followUser(data: { loggeduser: string, followedId: string }) {
        try {
            const follow = await this.userRepo.followUser(data);
            if (!follow) {
                return { success: false, message: 'unable to follow' }
            }
            return { success: true, message: 'user followed success' }
        } catch (error) {
            console.log('Error in followUser in application user userService');
            return { success: false, message: 'Someting went wrong' }
        }
    }

    async unfollowUser(data: { loggeduser: string, followedId: string }) {
        try {
            const follow = await this.userRepo.unfollowUser(data);
            if (!follow) {
                return { success: false, message: 'unable to unfollow' }
            }

            console.log(follow);
            return follow
            // return { success: true, message: 'user unfollowed success' }
        } catch (error) {
            console.log('Error in followUser in application user userService');
            return { success: false, message: 'Someting went wrong' }
        }
    }

    async getFriends(userId: string) {
        try {
            const data = await this.userRepo.getFriends(userId);
            return data
        } catch (error) {

        }
    }

    async savePost(data: { userId: string, postId: string }) {
        try {
            const result = await this.userRepo.savePost(data);
            return result;
        } catch (error) {
            console.log('Error in savePost in application user userService');
            return { success: false, message: 'Someting went wrong' }
        }
    }

}

