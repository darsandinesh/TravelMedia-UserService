import { IUser, UpdateUserProfileData, ValidationErrors } from "../../domain/entities/IUser";
import { UserRepository } from "../../domain/repositories/userRepository";
import { generateOtp } from "../../utils/generateOTP";
import { sendOtpEmail } from "../../utils/emialVerification";
import { IUserDetails, IUserPostDetails } from "../../domain/entities/IUserDeatils";
import { fetchFileFromS3, uploadFileToS3 } from "../../infrastructure/s3/s3Actions";
import bcrypt from 'bcryptjs'
import * as grpc from '@grpc/grpc-js'


interface user {
    email: string,
    password: string
}

export class UserService {

    private userRepo: UserRepository;

    constructor() {
        this.userRepo = new UserRepository();
    }

    validateUserData(userData: IUser): ValidationErrors {
        let errors: ValidationErrors = {};

        if (!userData.name || userData.name.trim().length === 0) {
            errors.name = "Name is required";
        }

        if (!userData.email || !/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(userData.email)) {
            errors.email = "Valid email is required";
        }

        if (!userData.phone || !/^\d{10}$/.test(userData.phone)) {
            errors.number = "Valid phone number is required (10 digits)";
        }

        if (!userData.password) {
            errors.password = "Password is required";
        } else if (userData.password.length < 6) {
            errors.password = "Password should be at least 6 characters";
        } else if (!/[A-Z]/.test(userData.password)) {
            errors.password = "Password must contain at least one uppercase letter";
        } else if (!/[0-9]/.test(userData.password)) {
            errors.password = "Password must contain at least one number";
        } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(userData.password)) {
            errors.password = "Password must contain at least one special character";
        }

        return errors;
    }

    async registerUser(userData: IUser): Promise<{ success: boolean, message: string, otp?: string, user_data?: IUser }> {
        try {

            const errors = this.validateUserData(userData);

            if (Object.keys(errors).length > 0) {
                return { success: false, message: "Validation errors" };
            }

            const existingUser = await this.userRepo.findEmail(userData.email);

            if (existingUser) {
                return { success: false, message: "Email already exists" };
            } else {
                const otp = generateOtp();
                await sendOtpEmail(userData.email, otp);

                return { message: "Verify the otp to complete registration", success: true, otp, user_data: userData };
            }

        } catch (error) {
            return { success: false, message: 'Internal Server Error' }
        }
    }

    async grpcregisterUser(data: IUser, callback: grpc.sendUnaryData<{ success: boolean, message: string, otp?: string, user_data?: IUser }>): Promise<void> {
        try {
            console.log(data,'-----------grpc data in the contoller')
            const errors = this.validateUserData(data);
            console.log(errors);
            if(Object.keys(errors).length>0){
                return callback(null,{
                    success:false,
                    message:'Invalid Datas try again!!!'
                })
            }

            const existingUser = await this.userRepo.findEmail(data.email);
            if(existingUser){
                return callback(null,{
                    success:false,
                    message:"Email address already exists"
                })
            }else{
                const otp =generateOtp();
                await sendOtpEmail(data.email,otp);
                return callback(null,{
                    success:true,
                    message:"verify the otp to complete registration",
                    otp,
                    user_data:data
                })
            }
        } catch (error) {
            return callback(null, {
                success: false,
                message: "Internal Server Error"
            })
        }
    }

    async resendOtp(email: string): Promise<{ success: boolean, message: string, otp?: string }> {
        try {
            console.log('resentotp in application use-case');
            const otp = generateOtp();
            await sendOtpEmail(email, otp);
            return { message: 'otp resend successful', success: true, otp }
        } catch (error) {
            return { success: false, message: "Internal Server Error" }
        }
    }

    async save(userData: IUser): Promise<{ success: boolean, message: string, user_data?: IUser }> {
        try {
            console.log(userData, '------------------------------------------------userService')
            const result = await this.userRepo.saveUser(userData);
            if (result) {
                return { success: true, message: 'Account created successfully', user_data: result };
            }
            else {
                return { success: false, message: 'someting went worng try again later' };
            }
        } catch (error) {
            return { success: false, message: 'Internal Server Error' }
        }
    }

    async loginUser({ email, password }: { email: string, password: string }, callback: grpc.sendUnaryData<{ success: boolean, message: string, user_data?: IUser }>): Promise<void> {
        try {
            const userData = await this.userRepo.check(email);
            if (!userData) {
                return callback(null, {
                    success: false,
                    message: "Incorrect Email Address or Password"
                });
            }
            const passwordMatch = await bcrypt.compare(password, userData.password);
            if (!passwordMatch) {
                return callback(null, {
                    success: false,
                    message: "Incorrect Email Address or Password"
                })
            }
            if (userData.isBlocked) {
                return callback(null, {
                    success: false,
                    message: 'You have been blocked by the admin'
                })
            }
            delete (userData as Partial<typeof userData>).password;

            return callback(null, {
                success: true,
                message: 'Logged in Successful',
                user_data: userData
            })
        } catch (error) {
            return callback(null, {
                success: false,
                message: 'Internal Server Error'
            })
        }
    }

    async verifyEmail(email: string): Promise<{ success: boolean, message: string, user_data?: { email: string, otp: string } }> {
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
            return { success: false, message: 'Internal Server Error' }
        }
    }

    async resetPassword(email: string, password: string): Promise<{ success: boolean, message: string }> {
        try {
            let user = await this.userRepo.resetPassword(email, password);
            console.log(user);
            return user;
        } catch (error) {
            return { success: false, message: 'Internal Server Error' }
        }
    }

    async loginWithGoogle(data: { email: string, fullname: string }): Promise<{ success: boolean, message: string, user_data?: IUser }> {
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
            if (user.isBlocked) {
                return { success: false, message: 'You have been blocked by the admin', user_data: user };
            } else {
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

    async updateUserProfile(data: UpdateUserProfileData): Promise<{ success: boolean; message: string; avatarUrl?: string }> {
        try {

            let profile_pic = '';
            if (data.image) {
                const buffer = Buffer.isBuffer(data.image.buffer) ? data.image.buffer : Buffer.from(data.image.buffer);
                const key = await uploadFileToS3(buffer, data.image.originalname);
                profile_pic = await fetchFileFromS3(key, 604800);
            }

            data.profilePicture = profile_pic;

            const updateUser = await this.userRepo.updateUserProfile(data);

            if (!updateUser) {
                return { success: false, message: 'Profile is up to date' };
            }

            return { success: true, message: 'Updated successfully', avatarUrl: profile_pic };
        } catch (error) {
            console.log('Error in updateUserProfile in application user userService');
            return { success: false, message: 'Internal server error' };
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
            return { success: true, message: 'user Unfollowed success' }
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

