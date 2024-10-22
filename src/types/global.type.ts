import { UserLogin } from "./user.type"

export type AxiosResponse<T> = {
    message: string,
    success: boolean,
    data: T
}
export type contextType = {
   userData:UserLogin
}