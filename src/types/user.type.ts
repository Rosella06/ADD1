export type UserLogin = {
    token: string,
    id: string,
    userRole: string,
    userStatus: boolean,
    displayName: string,
    userImage: string,
}

export type AddUsers = {
    userName: string;
    userPassword: string;
    userPincode: string;
    displayName: string;
    userRole: string;
    userStatus: boolean;
    createBy: string;
    fileupload: string;
};


export type Users = {
    id: string,
    UserName: string,
    DisplayName: string,
    UserImage?: string,
    UserRole: string,
    UserStatus: boolean,
    CreateBy: string,
    CreatedAt: string,
    UpdatedAt: string
}