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
        setDisplayName(userData.displayName);
        setUserLevel(userData.userRole);
        setUserStatus(userData.userStatus);

        if (userData.userImage) {
            setImagePreview(`${import.meta.env.VITE_APP_IMG}${userData.userImage}`);
        }
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

            const result: any = await axios.put(
                `${import.meta.env.VITE_APP_API}/users/${editingUserId}`,
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
        <div className="flex flex-col items-center min-h-screen bg-gray-100">
            <div className="card w-full h-screen p-6 bg-white shadow-xl text-blue-800 rounded-lg">
                <div className="settings-container h-full w-full">
                    <h1 className="text-4xl font-bold mb-6">Settings</h1>
                    {userData ? (
                        <div className="bg-white p-6 ">
                            <h2 className="text-3xl font-semibold text-gray-900 mb-4 text-center">
                                Welcome, {userData.displayName}
                            </h2>
                            {isEditing ? (
                                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center z-50">
                                    <div className="bg-white p-6 rounded-lg shadow-xl w-11/12 sm:w-1/2 lg:w-1/3">
                                        <div className="flex justify-between items-center mb-6">
                                            <h3 className="text-2xl font-bold text-center mb-4">Edit User</h3>
                                            <button
                                                onClick={closeModal}
                                                className="text-red-500 font-bold"
                                            >
                                                ✕
                                            </button>
                                        </div>

                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-lg font-medium text-gray-700">Display Name:</label>
                                                <input
                                                    type="text"
                                                    value={displayName}
                                                    onChange={(e) => setDisplayName(e.target.value)}
                                                    className="mt-1 p-2 border border-gray-300 rounded-lg w-full focus:ring focus:ring-blue-300 bg-white text-black"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-lg font-medium text-gray-700">User Role:</label>
                                                <select
                                                    value={userLevel}
                                                    onChange={(e) => setUserLevel(e.target.value)}
                                                    className="mt-1 p-2 border border-gray-300 rounded-lg w-full focus:ring focus:ring-blue-300 bg-white"
                                                >
                                                    <option value="USER">USER</option>
                                                    <option value="ADMIN">ADMIN</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-lg font-medium text-gray-700">User Status:</label>
                                                <select
                                                    value={userStatus ? '1' : '0'}
                                                    onChange={(e) => setUserStatus(e.target.value === '1')}
                                                    className="mt-1 p-2 border border-gray-300 rounded-lg w-full focus:ring focus:ring-blue-300 bg-white"
                                                >
                                                    <option value="1">เปิดใช้งาน</option>
                                                    <option value="0">ปิดใช้งาน</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-lg font-medium text-gray-700">User Image:</label>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={fileSelect}
                                                    className="mt-1 p-2  border-gray-300 rounded-lg w-full focus:ring focus:ring-blue-300 text-black"
                                                />
                                                {imagePreview && (
                                                    <img src={imagePreview} alt="Preview" className="mt-4 rounded-lg h-32 w-auto " />
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex justify-end mt-6 space-x-4">
                                            {/* <button
                                                onClick={closeModal}
                                                className="mr-2 bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded"
                                            >
                                                Cancel
                                            </button> */}
                                            <button
                                                onClick={handleSave}
                                                className="bg-green-500 hover:bg-green-600 text-white font-semibold px-4 py-2 rounded-lg focus:outline-none focus:ring focus:ring-green-300"
                                            >
                                                update
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex justify-center items-center ">
                                    <div className="flex flex-col items-center bg-white p-6 space-y-4 border border-gray-200 rounded-lg shadow-lg w-80 justify-center">
                                        {userData.userImage && (
                                            <img
                                                src={`${import.meta.env.VITE_APP_IMG}${userData.userImage}`}
                                                alt="User Profile"
                                                className="rounded-full h-32 w-32 mb-4"
                                            />
                                        )}
                                        <div className="text-center">
                                            <p className="text-lg font-semibold text-gray-800">Display Name: {userData.displayName}</p>
                                            <p className="text-md text-gray-600">User Level: {userData.userRole}</p>
                                            <p className="text-md text-gray-600">User Status: {userData.userStatus ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}</p>
                                        </div>
                                        <div className="flex justify-center mt-4">
                                            <button
                                                onClick={handleEdit}
                                                className="bg-gray-700 hover:bg-gray-800 text-white font-semibold px-4 py-2 rounded-lg focus:outline-none focus:ring focus:ring-gray-300"
                                            >
                                                Edit Profile
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <p className="text-lg text-gray-700">No user data available.</p>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Settings;
