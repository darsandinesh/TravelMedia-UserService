import { IUser } from "../entities/IUser";
import bcrypt from 'bcrypt';
import { IUserDocument, User } from '../../model/userModel'
import mongoose from "mongoose";
import { devNull } from "os";

export class UserRepository {

    async findEmail(email: string): Promise<IUser | null> {
        try {
            const user = await User.findOne({ email: email });
            return user
        } catch (error) {
            const err = error as Error;
            console.log('error in findEmail in userRepository-->', err);
            return null
        }
    }

    async saveUser(data: IUser): Promise<IUser> {
        try {
            console.log(data, '--------------------------------------userRepo');

            // Hash the password
            console.log(data.password);
            const hashedPass = await bcrypt.hash(data.password, 10);

            // Create a new user object with the hashed password
            const userData = { ...data, password: hashedPass };

            console.log(userData, '----------userData');

            // Create a new instance of the User model
            const newUser = new User(userData);

            // Save the user to the database
            await newUser.save();

            console.log(newUser, '-------------------------------------------');

            // Return the saved user data (you might want to omit the password)
            return newUser
        } catch (error) {
            const err = error as Error;
            console.error("Error saving user:", err);
            throw new Error(`Error saving user: ${err.message}`);
        }
    }

    async checkUser(email: string, password: string): Promise<{ success: boolean, message: string, user_data?: IUser }> {
        try {
            const user_data = await User.findOne({ email }).exec();

            if (!user_data) {
                return { success: false, message: "Incorrect Email Address or Password" };
            }

            const passwordMatch = await bcrypt.compare(password, user_data.password);
            if (!passwordMatch) {
                return { success: false, message: "Incorrect Email Address or Password" };
            }

            if (user_data.isBlocked) {
                return { success: false, message: "You have been blocked by the admin", user_data };
            }
            return { success: true, message: "Logged in successful", user_data };


        } catch (error) {
            const err = error as Error;
            console.error("Error saving user:", err);
            throw new Error(`Error saving user: ${err.message}`);
        }
    }

    async resetPassword(email: string, password: string): Promise<any> {
        try {
            const newHashedPass = await bcrypt.hash(password, 10);
            let user_data = await User.findOne({ email }).exec();
            if (user_data) {
                console.log('if in repo')
                const res = await User.updateOne({ email: email }, { $set: { password: newHashedPass } });
                console.log(res);
                return { success: true, message: 'Password changed successfully' }
            } else {
                console.log('else in repo')
                return { success: false, message: 'Something went wrong, Plase try again later.' }
            }

        } catch (error) {

        }
    }


}

//---------------------------------------------------------------------------------------------------------------------------------