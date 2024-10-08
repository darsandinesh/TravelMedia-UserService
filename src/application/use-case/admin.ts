import { IUSER, IUser } from "../../domain/entities/IUser";
import { AdminRepositoty } from "../../domain/repositories/adminRepository";

interface user {
    email: string,
    password: string
}

export class AdminService {
    private adminRepo: AdminRepositoty;

    constructor() {
        this.adminRepo = new AdminRepositoty();
    }

    async adminLogin(data: user): Promise<any> {
        try {
            const result = await this.adminRepo.checkAdmin(data.email, data.password);
            return result;
        } catch (error) {

        }
    }

    async userList() {
        try {
            const result = await this.adminRepo.userList();
            return result;
        } catch (error) {

        }
    }

    async changeStatus(email: string, isBlocked: boolean) {
        try {
            const result = await this.adminRepo.changeStatus(email, isBlocked);
            return result;
        } catch (error) {

        }
    }

    async getNewUsers(): Promise<{ success: boolean; message: string; data?: any }> {
        try {
            const result = await this.adminRepo.getNewUsers();

            if (!Array.isArray(result) || result.length === 0) {
                return { success: false, message: "No data found" };
            }

            return { success: true, message: "Data fetched successfully", data: result };
        } catch (error) {
            console.error("Error in getNewUsers in application level in admin side:", error);
            return { success: false, message: 'Internal server error' };
        }
    }

    async getTotalUsers(): Promise<{ success: boolean; message: string; count?: any }> {
        try {
            const data = await this.adminRepo.getTotalUsers()
            if(!data){
                return { success: true, message: "No data found", count: 0 }
            }
            console.log(data);
            return { success: true, message: "Data fetched successfully", count: data };
        } catch (error) {
            console.error("Error in getTotalUsers in application level in admin side:", error);
            return { success: false, message: 'Internal server error' };
        }
    }


}