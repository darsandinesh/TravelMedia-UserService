import { IUser } from "../entities/IUser";
import bcrypt from 'bcrypt';
import { IUserDocument, User } from '../../model/userModel'
import { IUserDetails, IUserPostDetails } from "../entities/IUserDeatils";

export class UserRepository {

    async findEmail(email: string): Promise<IUser | null> {
        try {
            const user = await User.findOne({ email: email }).select('-password');
            return user
        } catch (error) {
            const err = error as Error;
            console.log('error in findEmail in userRepository-->', err);
            return null
        }
    }

    async getUserProfile(userId: string): Promise<IUser | null> {
        try {
            const user = await User.findById(userId).select('-password').select('-isAdmin').select('-isBlocked');
            return user;
        } catch (error) {
            const err = error as Error;
            console.log('Error in getUserProfile in userRepsoitoy :', err);
            return null
        }
    }

    async updateUserProfile(data: any): Promise<IUser | null> {
        try {
            const currentUser = await User.findById(data.id);
            console.log('Current User:', currentUser);
            console.log('New Data:', data.data);

            const userExist = await User.updateOne(
                { _id: data.id },
                { $set: { name: data.data.name, bio: data.data.bio, location: data.data.location, profilePicture: data.image } }
            );

            console.log(userExist, '-------------============== 50');

            if (userExist.modifiedCount > 0) {
                const updatedUser = await User.findById(data.id);
                return updatedUser;
            } else {
                console.log('No changes were made to the document.');
                return null;
            }
        } catch (error) {
            console.error('Error updating user profile:', error);
            return null;
        }
    }

    async findUsers(search:string){
        try{
            const name = RegExp(search,"i");
            console.log(name,'----------name')
            const user = await User.find({
                "$or":[
                    {name:name},
                    {email:name}
                ]
            }).select('-password');
            console.log(user,'-----------=-=-=')
            return user
        }catch(error){
            console.log('Error in findUsers in the userRepo')
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

    async findUserDetailsForPost(userId: string): Promise<{ success: boolean; message: string; data?: IUserPostDetails }> {
        try {
            console.log('3', userId);
            const user = await User.findById(userId).exec() as IUser | null;
            console.log(user, '----------------------user data');
            if (!user) {
                return { success: false, message: "No user found" };
            }

            const datas: IUserPostDetails = {
                id: userId,
                name: user.name
            };

            return { success: true, message: "Data found", data: datas };
        } catch (error) {
            console.error("Error fetching user data", error);
            return { success: false, message: `Error fetching user data: ${(error as Error).message}` };
        }
    }




}

//---------------------------------------------------------------------------------------------------------------------------------