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
            const result = await this.adminRepo.changeStatus(email,isBlocked);
            return result;
        } catch (error) {

        }
    }
}