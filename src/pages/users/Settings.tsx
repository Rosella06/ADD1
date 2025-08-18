import { useContext, useState, useEffect, ChangeEvent } from "react";
import axios, { AxiosError } from 'axios';
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { FaCamera, FaSave, FaTimes, FaUserEdit } from "react-icons/fa";

import { cookieOption, cookies, encryptData, resizeImage, Usercontext } from "../../constants/constants";
import { UserLogin } from "../../types/user.type";
import defaultImage from '../../img/user.png'; // Import รูป default

// สร้าง Interface สำหรับ State ของฟอร์มเพื่อความชัดเจน
interface UserFormState {
    displayName: string;
    userRole: string;
    userStatus: boolean;
    userImageFile: File | null;
}

function Settings() {
    const { userData } = useContext(Usercontext) as { userData: UserLogin };
    const navigate = useNavigate();

    const [isEditing, setIsEditing] = useState(false);
    const [formState, setFormState] = useState<UserFormState>({
        displayName: '',
        userRole: 'USER',
        userStatus: false,
        userImageFile: null,
    });
    const [imagePreview, setImagePreview] = useState<string>('');
    
    // เมื่อ userData เปลี่ยน (เช่นหลัง login) ให้ตั้งค่าเริ่มต้น
    useEffect(() => {
        if (userData) {
            setFormState({
                displayName: userData.displayName || '',
                userRole: userData.userRole || 'USER',
                userStatus: userData.userStatus || false,
                userImageFile: null,
            });
            setImagePreview(userData.userImage ? `${import.meta.env.VITE_APP_IMG}${userData.userImage}` : defaultImage);
        }
    }, [userData]);

    const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const selectedFile = e.target.files[0];
            resizeImage(selectedFile)
                .then(resizedFile => {
                    setImagePreview(URL.createObjectURL(resizedFile));
                    setFormState(prev => ({ ...prev, userImageFile: resizedFile }));
                })
                .catch(error => console.error('Error resizing image:', error));
        }
    };

    // ฟังก์ชันยกเลิกการแก้ไข
    const handleCancel = () => {
        setIsEditing(false);
        // Reset form state to original userData
        if (userData) {
             setFormState({
                displayName: userData.displayName || '',
                userRole: userData.userRole || 'USER',
                userStatus: userData.userStatus || false,
                userImageFile: null,
            });
            setImagePreview(userData.userImage ? `${import.meta.env.VITE_APP_IMG}${userData.userImage}` : defaultImage);
        }
    };

    const handleSave = async () => {
        if (!userData?.id) return;

        try {
            const formData = new FormData();
            formData.append("DisplayName", formState.displayName);
            formData.append("UserStatus", formState.userStatus ? "1" : "0");
            
            // หมายเหตุ: โดยทั่วไปไม่ควรให้ผู้ใช้เปลี่ยน Role ของตัวเองในหน้านี้
            // แต่ยังคงโค้ดไว้ตามฟังก์ชันเดิม
            formData.append("UserRole", formState.userRole);

            if (formState.userImageFile) {
                formData.append("fileupload", formState.userImageFile);
            }

            const result = await axios.put(
                `${import.meta.env.VITE_APP_API}/users/${userData.id}`,
                formData,
                { headers: { Authorization: `Bearer ${userData.token}` } }
            );

            // สร้างข้อมูลใหม่สำหรับ Cookie โดยใช้ข้อมูลที่ได้จาก API ตอบกลับ
            const updatedApiData = result.data.data;
            const newUserData = {
                ...userData, // ใช้ข้อมูลเก่าเป็นฐาน
                displayName: updatedApiData.DisplayName,
                userRole: updatedApiData.UserRole,
                userStatus: updatedApiData.UserStatus,
                userImage: updatedApiData.UserImage || userData.userImage, // ใช้รูปใหม่ถ้ามี, หรือรูปเก่า
            };

            cookies.set("userData", String(encryptData(newUserData)), cookieOption);
            setIsEditing(false);

            await Swal.fire({
                icon: "success",
                title: "บันทึกข้อมูลสำเร็จ",
                timer: 1500,
                showConfirmButton: false,
            });
            
            // Reload หน้าเพื่อให้ Context และ UI ส่วนอื่นๆ (เช่น Header) อัปเดต
            window.location.reload();

        } catch (error) {
            const message = error instanceof AxiosError ? error.response?.data.message : "เกิดข้อผิดพลาดที่ไม่รู้จัก";
            Swal.fire({ icon: "error", title: "เกิดข้อผิดพลาด", text: message });
            console.error("Error updating user:", error);
        }
    };

    if (!userData) {
        return <div className="flex justify-center items-center h-screen"><span className="loading loading-spinner loading-lg"></span></div>;
    }

    return (
        <div className="flex flex-col items-center p-4 md:p-8 bg-gray-50 min-h-screen">
            <div className="w-full max-w-4xl mx-auto bg-white shadow-lg rounded-xl">
                <div className="p-6 md:p-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-6 pb-4 border-b">ตั้งค่าโปรไฟล์</h1>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Left Column: Profile Picture */}
                        <div className="md:col-span-1 flex flex-col items-center">
                            <div className="relative">
                                <img
                                    src={imagePreview}
                                    alt="Profile"
                                    className="rounded-full h-48 w-48 object-cover border-4 border-gray-100 shadow-md"
                                />
                                {isEditing && (
                                    <label htmlFor="file-upload" className="absolute bottom-2 right-2 btn btn-primary btn-circle">
                                         <FaCamera className="text-xl"/>
                                         <input id="file-upload" type="file" className="sr-only" onChange={handleFileSelect} accept="image/*" />
                                    </label>
                                )}
                            </div>
                        </div>

                        {/* Right Column: User Details */}
                        <div className="md:col-span-2 space-y-4">
                            {/* <div>
                                <label className="label"><span className="label-text font-semibold">User Name (ไม่สามารถแก้ไขได้)</span></label>
                                <input type="text" value={userData.displayName || 'N/A'} disabled className="input input-bordered w-full bg-gray-100" />
                            </div> */}
                            <div>
                                <label className="label"><span className="label-text font-semibold">Display Name</span></label>
                                <input
                                    type="text"
                                    value={formState.displayName}
                                    onChange={(e) => setFormState({...formState, displayName: e.target.value})}
                                    disabled={!isEditing}
                                    className="input input-bordered w-full bg-white disabled:bg-gray-100"
                                />
                            </div>
                             <div>
                                <label className="label"><span className="label-text font-semibold">Role</span></label>
                                <input type="text" value={formState.userRole} disabled className="input input-bordered w-full bg-gray-100" />
                                <p className="text-xs text-gray-500 mt-1">ตำแหน่งไม่สามารถแก้ไขได้ในหน้านี้</p>
                            </div>
                             <div>
                                <label className="label"><span className="label-text font-semibold">Status</span></label>
                                <select 
                                    value={formState.userStatus ? '1' : '0'} 
                                    onChange={(e) => setFormState({...formState, userStatus: e.target.value === '1'})}
                                    disabled={!isEditing}
                                    className="select select-bordered w-full bg-white disabled:bg-gray-100"
                                >
                                    <option value="1">เปิดใช้งาน</option>
                                    <option value="0">ปิดใช้งาน</option>
                                </select>
                            </div>

                            {/* Action Buttons */}
                            <div className="pt-4 flex justify-end gap-3">
                                {isEditing ? (
                                    <>
                                        <button onClick={handleCancel} className="btn btn-ghost"><FaTimes/> ยกเลิก</button>
                                        <button onClick={handleSave} className="btn btn-success text-white"><FaSave/> บันทึก</button>
                                    </>
                                ) : (
                                    <button onClick={() => setIsEditing(true)} className="btn btn-primary"><FaUserEdit/> แก้ไขโปรไฟล์</button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
             {/* ปุ่ม Testtools (ถ้าจำเป็น) */}
             <button
                onClick={() => navigate("/testtools")}
                className="fixed bottom-5 right-5 btn btn-accent shadow-lg z-50"
                title="ไปยังหน้า Testtools"
            >
                Test Tools
            </button>
        </div>
    );
}

export default Settings;