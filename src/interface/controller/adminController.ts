import { AdminService } from "../../application/use-case/admin"

interface userData {
    email: string,
    isBlocked: boolean
}
class adminController {
    private adminService: AdminService;

    constructor() {
        this.adminService = new AdminService();
    }

    async login(data: any) {
        try {
            // const email = data.email;
            // const password = data.password;
            const result = await this.adminService.adminLogin(data);
            return result;
        } catch (error) {

        }
    }

    async userList() {
        try {
            const result = await this.adminService.userList();
            return result;
        } catch (error) {

        }
    }

    async changeStatus(data: userData) {
        try {
            const email = data.email;
            const isBlocked = data.isBlocked
            const result = await this.adminService.changeStatus(email, isBlocked);
            return result;
        } catch (error) {

        }
    }


    async getNewUsers() {
        try {
            const result = await this.adminService.getNewUsers();
            return result;
        } catch (error) {
            console.log('error in getNewUsers u')
        }
    }

    async getTotalUsers() {
        try {
            const result = await this.adminService.getTotalUsers();
            return result;
        } catch (error) {
            console.log('error in getNewUsers u')
        }
    }
}

export const AdminController = new adminController();