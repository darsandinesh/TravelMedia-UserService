export interface IUser {
    name: string;
    email: string;
    password: string;
    location?:string;
    profilePicture?: string;
    followers?: string[];
    followings?: string[];
    isOnline?: boolean;
    isAdmin?: boolean;
    bio?: string;
    isBlocked?: boolean;
    created_at?: Date;
}

export interface IUSER {
    _id: string;
    name: string;
    email: string;
    password: string;
    location?:string;
    profilePicture?: string;
    followers?: string[];
    followings?: string[];
    likedPost?:string[];
    isOnline?: boolean;
    isAdmin?: boolean;
    bio?: string;
    isBlocked?: boolean;
    created_at?: Date;
}