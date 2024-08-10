export interface IUser {
    name: string;
    email: string;
    password: string;
    profilePicture?: string;
    followers?: string[];
    followings?: string[];
    isOnline?:boolean;
    isAdmin?: boolean;
    desc?: string;
    created_at?: Date;
}