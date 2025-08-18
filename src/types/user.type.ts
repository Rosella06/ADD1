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
  
    displayName: string;
    userRole: string;
    userStatus: boolean;
    createBy: string;
    fileupload: string;
};


export type Users = {
    id: string,
    userName: string,
    displayName: string,
    userImage?: string,
    userRole: string,
    userStatus: boolean,
    createBy: string,
    createdAt: string,
    updatedAt: string
   
}