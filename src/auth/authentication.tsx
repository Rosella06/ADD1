import { cookies, Usercontext } from "../constants/constants"
import { Navigate,Outlet } from "react-router-dom"
import Login from "../pages/login/login"
import { contextType } from "../types/global.type"
import { useContext } from "react"

export const Islogout = () => {
    const cookieEncode = cookies.get('userData')
    if (cookieEncode !== undefined) {
        return <Navigate to="/" />
      }

    return <Login />
}

export const UserRole = () => {
  const { userData } = useContext(Usercontext) as contextType;
  if (userData.userRole !== "ADMIN") {
      return <Navigate to="/" />
    }

  return <Outlet />
}

