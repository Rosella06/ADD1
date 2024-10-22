import Cookies, { CookieSetOptions } from "universal-cookie";
import { UserLogin } from "../types/user.type";
import CryptoJS from "crypto-js"
import { createContext } from "react";
import { contextType } from "../types/global.type";

export const cookies = new Cookies();
const expirationDate = new Date();
expirationDate.setDate(expirationDate.getDate() + 3);
export const cookieOption: CookieSetOptions = { expires: expirationDate, }

export const encryptData = (data: UserLogin) => CryptoJS.AES.encrypt(JSON.stringify(data), `${import.meta.env.VITE_APP_SECRET}`)
export const decryptData = (data: string) => CryptoJS.AES.decrypt(data, `${import.meta.env.VITE_APP_SECRET}`)

export const resizeImage = (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
  
      reader.onload = (e: ProgressEvent<FileReader>) => {
        const image: HTMLImageElement = new Image()
        image.src = e.target?.result as string
  
        image.onload = () => {
          const canvas = document.createElement('canvas')
          const maxDimensions = { width: 720, height: 720 }
          const scaleFactor = Math.min(maxDimensions.width / image.width, maxDimensions.height / image.height)
  
          canvas.width = image.width * scaleFactor
          canvas.height = image.height * scaleFactor
  
          const context: CanvasRenderingContext2D | null = canvas.getContext('2d')
          context?.drawImage(image, 0, 0, canvas.width, canvas.height)
  
          canvas.toBlob(
            (blob: Blob | null) => {
              const resizedFile = new File([blob as Blob], file.name, { type: file.type })
              resolve(resizedFile)
            },
            file.type,
            1 // JPEG quality, 1 is maximum
          )
        }
      }
  
      reader.onerror = (error) => {
        reject(error)
      }
  
      reader.readAsDataURL(file)
    })
  }
  export const Usercontext = createContext<contextType | null>(null)
