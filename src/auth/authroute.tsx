import { ReactElement, useEffect, useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import {  cookieOption, cookies, decryptData } from '../constants/constants'
import CryptoJS from "crypto-js"
import { UserLogin } from '../types/user.type'

type AuthProps = {
  children: ReactElement
}

const ProtectedRoute = ({ children }: AuthProps) => {
  const [isValid, setIsValid] = useState<boolean | null>(null)
  const cookieEncode = cookies.get('userData')

  useEffect(() => {
    const verifyToken = async (cookieEncode: string) => {
      try {
        const cookieObject: UserLogin = JSON.parse(decryptData(cookieEncode).toString(CryptoJS.enc.Utf8))
        if (cookieObject.token) {
          setIsValid(true)
        } else {
          cookies.remove('userData', cookieOption)
          cookies.update()
          setIsValid(false)
        }
      } catch (error) {
        cookies.remove('userData', cookieOption)
        cookies.update()
        setIsValid(false)
      }
    }
    if (cookieEncode !== undefined) {
      verifyToken(cookieEncode)
    
    } else {
      setIsValid(false)
    
    }
  }, [cookieEncode])

  if (isValid === null) {
    return null 
  }

  return isValid ? children : <Navigate to="/Login" />
}

export function AuthRoute() {
  return (
    <ProtectedRoute>
      <Outlet />
    </ProtectedRoute>
  )
}
