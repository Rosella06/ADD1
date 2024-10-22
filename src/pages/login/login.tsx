import axios, { AxiosError } from "axios";
import { FormEvent, useEffect, useState } from "react";
import Swal from "sweetalert2";
import { FaUser, FaLock } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { AxiosResponse } from "../../types/global.type";
import { UserLogin } from "../../types/user.type";
import { cookieOption, cookies, encryptData } from "../../constants/constants";

function Login() { 
const [currentDateTime, setCurrentDateTime] = useState("");

    const [qr, setQr] = useState('')
    let value_id = ''
    const baseurl = `${import.meta.env.VITE_APP_API}/auth/login`;

    useEffect(() => {
        document.addEventListener('keypress', onBarcodeScan)
    }, [])

    const onBarcodeScan = async (e: KeyboardEvent) => {
        if (e.key === 'Enter') {
            setQr(value_id)
            value_id = ''
        } else {
            value_id += e.key
        }
    }

    useEffect(() => {
        if (qr !== '') qrLogin()
    }, [qr])

    const qrLogin = async () => {
        try {
            if (qr !== '') {
                const response = await axios.post<AxiosResponse<UserLogin>>(baseurl, {
                    pinCode: qr
                })

                const { token, id, userRole, userStatus, displayName, userImage } = response.data.data;

                const userData = {
                    token, id, userRole, userStatus, displayName, userImage
                }
                cookies.set('userData', String(encryptData(userData)), cookieOption);

                navigate("/");

                Swal.fire({
                    icon: "success",
                    title: "Login Successful",
                    text: "Welcome back!",
                });
            }
            else {
                console.warn('กรุณาสแกน qr code เพื่อ Login')
            }
        } catch (error) {
            if (error instanceof AxiosError) {
                console.error(error.response?.data.message)
            }
            else {
                console.error(error)
            }
        }
    }
    const [userData, setUserData] = useState({
        userName: "",
        passWord: "",
    });

    const navigate = useNavigate();

    const handleSignIn = async (e: FormEvent) => {
        e.preventDefault();

        const { userName, passWord } = userData;


        if (userName && passWord) {
            try {
                const response = await axios.post<AxiosResponse<UserLogin>>(baseurl, {
                    UserName: userName,
                    UserPassword: passWord
                });


                const { token, id, userRole, userStatus, displayName, userImage } = response.data.data;

                const userData = {
                    token, id, userRole, userStatus, displayName, userImage
                }
                cookies.set('userData', String(encryptData(userData)), cookieOption);
                navigate("/");
                Swal.fire({
                    icon: "success",
                    title: "Login Successful",
                    text: "Welcome back!",
                });
            } catch (error) {
                if (error instanceof AxiosError) {
                    const errorMessage = error.response?.data?.message || "An error occurred. Please try again.";
                    Swal.fire({
                        icon: "error",
                        title: "Login Failed",
                        text: errorMessage,
                    });
                } else {
                    Swal.fire({
                        icon: "error",
                        title: "Login Failed",
                        text: "An unexpected error occurred. Please try again.",
                    });
                    console.error("Error:", error);
                }
            }
        } else {
            Swal.fire({
                icon: "warning",
                title: "Login Failed",
                text: "กรุณากรอกข้อมูลให้ครบ",
            });
        }
    };

    // const handleLogout = () => {
    //     cookies.remove('userData');
    //     navigate("/login"); // นำผู้ใช้กลับไปยังหน้า login
    //     Swal.fire({
    //         icon: "success",
    //         title: "Logged out",
    //         text: "You have been logged out successfully.",
    //     });
    // };

    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date();
            const formattedDateTime = now.toLocaleString(); 
            setCurrentDateTime(formattedDateTime);
        }, 1000); 
        return () => clearInterval(interval);
    }, []);
    

    return (
        <div className="flex items-center justify-center min-h-screen bg-blue-800">
            <div className="w-full max-w-lg p-10 bg-white rounded-lg shadow-md">
                <h1 className="text-5xl font-extrabold text-blue-800 text-center p-2">ADD Login</h1>
                <h2 className="text-lg text-center text-gray-700 mb-12">กรุณากรอกข้อมูล หรือ Scan Barcode เพื่อใช้งาน</h2>
                <form onSubmit={handleSignIn}>
                    <div className="space-y-6">
                        <div className="relative">
                            <FaUser className="absolute top-1/2 left-3 transform -translate-y-1/2 text-blue-800" />
                            <input
                                id="userName"
                                className="input input-bordered w-full pl-12 py-3 placeholder-gray-500 text-gray-700 bg-transparent border-gray-300 focus:ring-2 focus:ring-blue-400 focus:border-blue-500"
                                placeholder="กรอกชื่อผู้ใช้"
                                type="text"
                                value={userData.userName}
                                onChange={(e) => setUserData({ ...userData, userName: e.target.value })}
                                aria-label="User Name"
                            />
                        </div>
                        <div className="relative">
                            <FaLock className="absolute top-1/2 left-3 transform -translate-y-1/2 text-blue-800" />
                            <input
                                id="passWord"
                                className="input input-bordered w-full pl-12 py-3 placeholder-gray-500 text-gray-700 bg-transparent border-gray-300 focus:ring-2 focus:ring-blue-400 focus:border-blue-500"
                                placeholder="กรอกรหัสผ่าน"
                                type="password"
                                value={userData.passWord}
                                onChange={(e) => setUserData({ ...userData, passWord: e.target.value })}
                                aria-label="Password"
                            />
                        </div>
                        <div className="mt-6">
                            <button
                                type="submit"
                                className="w-full py-2 border border-green-300 text-green-400 font-bold rounded-lg bg-transparent hover:bg-blue-700 transition duration-300 mt-3">
                                Login
                            </button>
                        </div>
                    </div>
                </form>   
                <div className="text-right text-xs text-blue-800 mt-4">
                    {currentDateTime}
                </div>
            </div>
        </div>
    );
}

export default Login;


// sn เลขไอดี
// ชื่อผู้
// หอผู้ป่วย
// แพ้ยา
// เพิ่มตัวแบคกลับ
// เพิ่มตัวยืนยัน
// เพิ่มตัวยกเลิก
// เพิ่มตัวจัดเสร็จ
// เพิ่มตัว ปุ่มเข้าใช้งาน แล้ว มีแบบกดสแกน
// เพิ่มตัว เลือกยืนยันยา
// แก้ ขึ้นแสดงสถานะทั้งหมดง
// ล็อคเอ้า
// เพิ่มตัวเช็ค
