import bcrtpt from 'bcryptjs';
import { User } from '../../model/userModel';
import { IUser } from '../entities/IUser';

export class AdminRepositoty {

    async checkAdmin(email: string, password: string): Promise<any> {
        try {
            const admin_data = await User.findOne({ email }).exec();
            if (!admin_data) {
                return { success: false, message: "Incorrect Email Address or Password" };
            }

            if (!admin_data.isAdmin) {
                return { success: false, message: "You are not authorized" };
            }

            const passwordMatch = await bcrtpt.compare(password, admin_data.password);

            if (!passwordMatch) {
                return { success: false, message: "Incorrect Email Address or Password" };

            }

            return { success: true, message: "logged in succesful", data: admin_data };

        } catch (error) {
            const err = error as Error;
            console.log("Error checking admin :", err);
            throw new Error(`Error checking admin:${err.message}`);
        }
    }

    async userList() {
        try {
            const userData = await User.find({ isAdmin: false }).sort({ _id: -1 });
            return userData;
        } catch (error) {
            const err = error as Error;
            console.log("Error user listing admin :", err);
            throw new Error(`Error user listing admin :${err.message}`);
        }
    }

    async changeStatus(email: string, isBlocked: boolean): Promise<{ success: boolean; message: string }> {
        try {
            // Find the user by email
            const userData = await User.findOne({ email });

            if (!userData) {
                return { success: false, message: 'User not found' };
            }
            const updated = await User.updateOne({ email: email }, { $set: { isBlocked: isBlocked } });
            console.log('Matched:', updated.matchedCount, 'Modified:', updated.modifiedCount);
            if (updated.modifiedCount == 1) {
                return { success: true, message: 'Status of the user is changed' };
            } else {
                return { success: false, message: 'Something went wrong. Try again later' };
            }

        } catch (error) {
            console.error("Error user status change admin:", error);
            const err = error as Error;
            return { success: false, message: `Error updating user status: ${err.message}` };
        }
    }

    async getNewUsers() {
        try {
            const userData = await User.find({}).sort({ _id: -1 }).limit(5);
            console.log(userData);
            return userData
        } catch (error) {
            console.log("Error in getNewUsers in adminRepo : ", error);
            const err = error as Error;
            return { success: false, messsage: err.message };
        }
    }

    async getTotalUsers() {
        try {
            const userData = await User.find().countDocuments()
            return userData;
        } catch (error) {
            console.log("Error in getTotalUsers in adminRepo : ", error);
            const err = error as Error;
            return { success: false, messsage: err.message };
        }
    }

    async getUserData() {
        try {
            const totalRevenue = await User.aggregate([
                { $match: { isMember: true } },
                { $group: { _id: null, totalRevenue: { $sum: "$membership.amount" } } }
            ]);
            const totalUsers = await User.countDocuments();
            const primeUsers = await User.countDocuments({ isMember: true });
            const normalUsers = totalUsers - primeUsers;
            const prime = await User.find({ isMember: true }).select('membership');
            const data = {
                totalRevenue,
                primeUsers,
                normalUsers,
                prime
            }
            return data;
        } catch (error) {
            console.log("Error in getTotalUsers in adminRepo : ", error);
            const err = error as Error;
            return { success: false, messsage: err.message };
        }
    }

    async getUser(id:string){
        try {
            const data = await User.findOne({_id:id}).select('-password'); 
            return data
        } catch (error) {
            console.log("Error in getUser in adminRepo : ", error);
            const err = error as Error;
            return { success: false, messsage: err.message };
        }
    }

}