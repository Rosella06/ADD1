import { useContext, useState, useEffect, ChangeEvent } from "react";
import axios from 'axios';
import { cookieOption, cookies, encryptData, resizeImage, Usercontext } from "../../constants/constants";
import { UserLogin } from "../../types/user.type";

function Settings() {
    const { userData } = useContext(Usercontext) as { userData: UserLogin; };
    const [isEditing, setIsEditing] = useState(false);
    const [userStatus, setUserStatus] = useState(userData?.userStatus || false);
    const [displayName, setDisplayName] = useState(userData ? userData.displayName : '');
    const [userLevel, setUserLevel] = useState(userData ? userData.userRole : 'USER');
    const editingUserId = userData ? userData.id : null;
    const [drugImg, setDrugImg] = useState(null as File | null);
    const [imagePreview, setImagePreview] = useState('');

    useEffect(() => {
        if (userData) {
            setDisplayName(userData.displayName || '');
            setUserLevel(userData.userRole || 'USER');
            setUserStatus(userData.userStatus || false);
            if (userData.userImage) {
                setImagePreview(`${import.meta.env.VITE_APP_IMG}${userData.userImage}`);
            }
        }
    }, [userData]);

    const handleEdit = () => {
        setIsEditing(true);
    };

    const fileSelect = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const selectedFile = e.target.files[0];
            resizeImage(selectedFile)
                .then((resizedFile) => {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        setImagePreview(reader.result as string);
                    };
                    reader.readAsDataURL(resizedFile);
                    setDrugImg(resizedFile);
                })
                .catch((error) => {
                    console.error('Error resizing image:', error);
                });
        }
    };

    const handleSave = async () => {
        try {
            const formData = new FormData();
            formData.append("DisplayName", displayName);
            formData.append("UserStatus", userStatus ? "1" : "0");
            formData.append("UserRole", userLevel);
            if (drugImg) {
                formData.append("fileupload", drugImg);
            }

            const result: any = await axios.put(`${import.meta.env.VITE_APP_API}/users/${editingUserId}`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${userData.token}`,
                    },
                }
            );

            const { id, UserRole, UserStatus, DisplayName, UserImage } = result.data.data;
            const userDataNew = {
                token: userData.token, id, userRole: UserRole, userStatus: UserStatus, displayName: DisplayName, userImage: UserImage
            }
            cookies.set('userData', String(encryptData(userDataNew)), cookieOption);

            setIsEditing(false);
            alert('User updated successfully!');
            window.location.reload();
        } catch (error) {
            console.error('Error updating user:', error);
            alert('Failed to update user. Please try again.');
        }
    };

    const closeModal = () => {
        setIsEditing(false);
    };

    return (
        <div className="flex flex-col items-center min-h-screen bg-gradient-to-r from-white to-white">
            <div className="w-full max-w-4xl p-6 bg-white rounded-lg mt-10 ">
                <h1 className="text-4xl font-bold text-center text-blue-900 mb-8">Settings</h1>

                {userData ? (
                    <div className="flex justify-center">
                        {isEditing ? (
                            <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
                                <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-xl">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-2xl font-bold text-blue-900">แก้ไขข้อมูลผู้ใช้</h3>
                                        <button
                                            onClick={closeModal}
                                            className="text-red-500 font-bold text-xl hover:text-red-700"
                                        >
                                            ✕
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 gap-5">
                                        <div>
                                            <label className="block text-lg font-medium text-gray-700">ชื่อผู้ใช้:</label>
                                            <input
                                                type="text"
                                                value={displayName}
                                                onChange={(e) => setDisplayName(e.target.value)}
                                                className="mt-1 p-2 border border-gray-300 rounded-lg w-full focus:ring focus:ring-blue-300 bg-white text-black"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-lg font-medium text-gray-700">บทบาทผู้ใช้:</label>
                                            <select
                                                value={userLevel}
                                                onChange={(e) => setUserLevel(e.target.value)}
                                                className="mt-1 p-2 border border-gray-300 rounded-lg w-full focus:ring focus:ring-blue-300 bg-white text-black"
                                            >
                                                <option value="USER">USER</option>
                                                <option value="ADMIN">ADMIN</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-lg font-medium text-gray-700">สถานะผู้ใช้:</label>
                                            <select
                                                value={userStatus ? '1' : '0'}
                                                onChange={(e) => setUserStatus(e.target.value === '1')}
                                                className="mt-1 p-2 border border-gray-300 rounded-lg w-full focus:ring focus:ring-blue-300 bg-white text-black"
                                            >
                                                <option value="1">เปิดใช้งาน</option>
                                                <option value="0">ปิดใช้งาน</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-lg font-medium text-gray-700">รูปภาพผู้ใช้:</label>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={fileSelect}
                                                className="mt-1 p-2 border border-gray-300  w-full focus:ring  bg-white text-black"
                                            />
                                            {imagePreview && (
                                                <img
                                                    src={imagePreview}
                                                    alt="Preview"
                                                    className="mt-4 rounded-lg h-32 w-auto mx-auto"
                                                />
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex justify-end mt-6">
                                        <button
                                            onClick={handleSave}
                                            className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded-lg transition duration-200"
                                        >
                                            บันทึกข้อมูล
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center p-6 border border-gray-200 rounded-xl shadow-md w-full max-w-sm bg-white">
                                {userData.userImage && (
                                    <img
                                        src={`${import.meta.env.VITE_APP_IMG}${userData.userImage}`}
                                        alt="User"
                                        className="rounded-full h-32 w-32 mb-4 object-cover "
                                    />
                                )}
                                <div className="text-center space-y-2">
                                    <p className="text-lg font-semibold text-gray-800">ชื่อ: {userData.displayName}</p>
                                    <p className="text-md text-gray-600">บทบาท: {userData.userRole}</p>
                                    <p className="text-md text-gray-600">
                                        สถานะ:{" "}
                                        <span
                                            className={`font-bold ${userData.userStatus ? "text-green-600" : "text-red-500"
                                                }`}
                                        >
                                            {userData.userStatus ? "เปิดใช้งาน" : "ปิดใช้งาน"}
                                        </span>
                                    </p>
                                </div>
                                <button
                                    onClick={handleEdit}
                                    className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg transition duration-200"
                                >
                                    แก้ไขโปรไฟล์
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <p className="text-center">กำลังโหลดข้อมูลผู้ใช้...</p>
                )}
            </div>
        </div>
    );
}


export default Settings;
