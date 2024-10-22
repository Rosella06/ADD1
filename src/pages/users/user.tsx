import React, { useState, useEffect, useContext, ChangeEvent, useRef } from 'react';
import axios from 'axios';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import { resizeImage, Usercontext } from '../../constants/constants';
import { contextType } from '../../types/global.type';
import { Users } from '../../types/user.type';
import DataTable, { TableColumn } from 'react-data-table-component';
import { QRCodeSVG } from 'qrcode.react';
import Swal from 'sweetalert2';
import "../../styles/styles.css"
import ReactToPrint from "react-to-print"
import { RiPrinterLine } from "react-icons/ri"
import defaultImage from '../../img/user.png';

const AddUser: React.FC = () => {
    const [userName, setUserName] = useState('');
    const [userPassword, setUserPassword] = useState('');
    const [userPincode, setUserPincode] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [userRole, setUserRole] = useState('USER');
    const [userStatus, setUserStatus] = useState(false);
    const [userImageFile, setUserImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState('');
    const [users, setUsers] = useState<Users[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [editingUserId, setEditingUserId] = useState<string | null>(null);
    const { userData } = useContext(Usercontext) as contextType;
    const { token } = userData;
    const [drugImg, setDrugImg] = useState(null as File | null);
    const [pinCode, setPinCode] = useState('');
    const [qrModal, setQrModal] = useState(false);
    const contentRef = useRef<SVGSVGElement>(null);
    const [filteredRole, setFilteredRole] = useState('ALL');
    const [searchTerm, setSearchTerm] = useState('');

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${import.meta.env.VITE_APP_API}/users`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log(response.data.data)
            setUsers(response.data.data.filter((e: { id: string; }) => e.id !== userData.id));
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        if (userImageFile) {
            console.log("log")
            const objectUrl = URL.createObjectURL(userImageFile);
            setImagePreview(objectUrl);
            return () => URL.revokeObjectURL(objectUrl);
        }
    }, [userImageFile]);



    const columns: TableColumn<Users>[] = [
        {
            name: 'Image',
            cell: (item) => (
                <img
                    src={item.UserImage ? `${import.meta.env.VITE_APP_IMG}${item.UserImage}` : defaultImage}
                    alt="drugsimg"
                    className="rounded-md h-20 w-20 object-cover"
                />
            ),
            sortable: true,
        },
        {
            name: 'User Name',
            selector: (row) => row.UserName,
            sortable: true,
        },
        {
            name: 'Display Name',
            selector: (row) => row.DisplayName,
            sortable: true,
        },
        {
            name: 'Role',
            selector: (row) => row.UserRole,
        },
        {
            name: 'Status',
            selector: (row) => (row.UserStatus ? 'เปิดใช้งาน' : 'ปิดใช้งาน'),
        },
        {
            name: 'Actions',
            cell: (row) => (
                <>
                    <button onClick={() => handleEdit(row)} className="text-yellow-400 hover:underline text-3xl mr-3">
                        <FaEdit />
                    </button>
                    <button onClick={() => handleDelete(row.id)} className="ml-2 text-red-600 hover:underline text-2xl">
                        <FaTrash />
                    </button>
                    <button onClick={async () => {
                        try {
                            const response = await axios.get(`${import.meta.env.VITE_APP_API}/auth/qr/${row.id}`, {
                                headers: { Authorization: `Bearer ${token}` },
                            });
                            setPinCode(response.data.data.pinCode);
                        } catch (error) {
                            console.error(error);
                        } finally {
                            setQrModal(true);
                        }
                    }} className="ml-5 text-md text-blue-600 hover:underline">
                        สร้าง QR CODE
                    </button>
                </>
            ),
        },
    ];

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("UserName", userName);
            formData.append("DisplayName", displayName);
            formData.append("UserStatus", userStatus ? "1" : "0");
            formData.append("CreateBy", "-");
            formData.append("UserRole", userRole);

            if (drugImg) {
                formData.append("fileupload", drugImg);
            }

            if (editingUserId) {
                await axios.put(
                    `${import.meta.env.VITE_APP_API}/users/${editingUserId}`,
                    formData,
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
            } else {
                formData.append("UserPassword", userPassword);
                formData.append("UserPincode", userPincode);
                await axios.post(
                    `${import.meta.env.VITE_APP_API}/auth/register`,
                    formData,
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
            }

            resetForm();
            fetchUsers();

            Swal.fire({
                icon: "success",
                title: editingUserId ? "แก้ไขข้อมูลผู้ใช้งานเรียบร้อย" : "เพิ่มข้อมูลผู้ใช้งานเรียบร้อย",
                showConfirmButton: false,
                timer: 1500
            });
        } catch (error) {
            let errorMsg = 'An unexpected error occurred.';
            if (axios.isAxiosError(error)) {
                errorMsg = error.response?.data?.message || errorMsg;
            } else if (error instanceof Error) {
                errorMsg = error.message;
            }
            console.log(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (user: any) => {
        setUserName(user.UserName);
        setDisplayName(user.DisplayName);
        setUserRole(user.UserRole);
        setUserStatus(user.UserStatus);
        setImagePreview(import.meta.env.VITE_APP_IMG + user.UserImage || null);
        setEditingUserId(user.id);
        setShowForm(true);
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

    const resetForm = () => {
        setUserName('');
        setUserPassword('');
        setUserPincode('');
        setDisplayName('');
        setUserRole('USER');
        setUserStatus(false);
        setUserImageFile(null);
        setImagePreview('');
        setEditingUserId(null);
        setShowForm(false);
    };

    const handleDelete = async (userId: string) => {
        const result = await Swal.fire({
            title: "คุณต้องการลบรายการหรือไม่?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "ลบ",
            cancelButtonText: "ยกเลิก",
        });

        if (result.isConfirmed) {
            setLoading(true);
            try {
                await axios.delete(`${import.meta.env.VITE_APP_API}/users/${userId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                Swal.fire({
                    icon: "success",
                    title: "ลบผู้ใช้สำเร็จ",
                });
                fetchUsers();
            } catch (error) {
                console.error('Error deleting user:', error);
                Swal.fire({
                    icon: "error",
                    title: "ลบผู้ใช้ไม่สำเร็จ",
                });
            } finally {
                setLoading(false);
            }
        }
    };

    if (loading) {
        return <div className="loader">Loading...</div>;
    }
    const filteredUsers = users.filter(user =>
        (user.UserName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.DisplayName.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (filteredRole === 'ALL' || user.UserRole === filteredRole)
    );

    return (
        <div className="flex flex-col h-screen w-full ">
            {showForm ? (
                <>
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
                        <div className="bg-white p-6 rounded shadow-lg w-full max-w-lg">
                            <h2 className="text-2xl font-bold mb-4 text-blue-800">
                                <div className="flex justify-between items-center mb-6">
                                    {editingUserId ? 'Edit User' : 'Add New User'}
                                    <button
                                        onClick={resetForm}
                                        className="text-red-500 font-bold"
                                    >
                                        ✕
                                    </button>
                                </div>
                            </h2>
                            <form onSubmit={handleSubmit}>
                                <div className="flex flex-col mb-2">
                                    <label className="block text-gray-700 text-xs font-bold mb-1" htmlFor="userName">
                                        <span className="inline-flex items-center">
                                            <i className="fas fa-user mr-2 text-gray-500"></i> User Name
                                        </span>
                                    </label>
                                    <input
                                        type="text"
                                        value={userName}
                                        onChange={(e) => setUserName(e.target.value)}
                                        required
                                        className="p-2 border border-gray-300 rounded bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    />
                                </div>
                                {!editingUserId &&
                                    <div className="flex flex-col mb-2">
                                        <label className="block text-gray-700 text-xs font-bold mb-1" htmlFor="userPassword">
                                            <span className="inline-flex items-center">
                                                <i className="fas fa-lock mr-2 text-gray-500"></i> Password
                                            </span>
                                        </label>
                                        <input
                                            type="password"
                                            value={userPassword}
                                            onChange={(e) => setUserPassword(e.target.value)}
                                            required
                                            className="p-1 border border-gray-300 rounded  bg-white"
                                        />
                                    </div>}
                                {!editingUserId &&
                                    <div className="flex flex-col mb-2">
                                        <label className="block text-gray-700 text-xs font-bold mb-1" htmlFor="userPincode">
                                            <span className="inline-flex items-center">
                                                <i className="fas fa-key mr-2 text-gray-500"></i> User Pincode
                                            </span>
                                        </label>
                                        <input
                                            type="text"
                                            value={userPincode}
                                            onChange={(e) => setUserPincode(e.target.value)}
                                            required
                                            className="p-1 border border-gray-300 rounded  bg-white"
                                        />
                                    </div>}
                                <div className="flex flex-col mb-2">
                                    <label className="block text-gray-700 text-xs font-bold mb-1" htmlFor="displayName">
                                        <span className="inline-flex items-center">
                                            <i className="fas fa-tag mr-2 text-gray-500"></i> Display Name
                                        </span>
                                    </label>
                                    <input
                                        type="text"
                                        value={displayName}
                                        onChange={(e) => setDisplayName(e.target.value)}
                                        required
                                        className="p-1 border border-gray-300 rounded  bg-white"
                                    />
                                </div>
                                <div className="flex flex-col mb-4">
                                    <label className="block text-gray-700 text-xs font-bold mb-1" htmlFor="userRole">
                                        <span className="inline-flex items-center">
                                            <i className="fas fa-user-shield mr-2 text-gray-500"></i> User Role
                                        </span>
                                    </label>
                                    <select
                                        value={userRole}
                                        onChange={(e) => setUserRole(e.target.value)}
                                        className="border rounded-lg py-1 px-2 text-gray-700 focus:outline-none focus:shadow-outline  bg-white"
                                    >
                                        <option value="USER">USER</option>
                                        <option value="ADMIN">ADMIN</option>
                                    </select>
                                </div>
                                <div className="flex flex-col mb-4">
                                    <label className="block text-gray-700 text-xs font-bold mb-1" htmlFor="userRole">
                                        <span className="inline-flex items-center">
                                            <i className="fas fa-user-shield mr-2 text-gray-500"></i> User Status
                                        </span>
                                    </label>
                                    <select
                                        value={userStatus ? '1' : '0'}
                                        onChange={() => setUserStatus(!userStatus)}
                                        className="border rounded-lg py-1 px-2 text-gray-700 focus:outline-none focus:shadow-outline  bg-white"
                                    >
                                        <option value="1">เปิดใช้งาน</option>
                                        <option value="0">ปิดใช้งาน</option>
                                    </select>
                                </div>
                                <div className="flex flex-col mb-2">
                                    <label className="block text-gray-700 text-xs font-bold mb-1" htmlFor="userRole">
                                        <span className="inline-flex items-center">
                                            <i className="fas fa-user-shield mr-2 text-gray-500"></i>  User Image
                                        </span>
                                    </label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={fileSelect}
                                        className="  rounded-lg py-1 px-2 text-gray-700 focus:outline-none focus:shadow-outline "
                                    />
                                </div>

                                {imagePreview && (
                                    <img src={imagePreview} alt="preview" className="my-4 rounded-lg h-32 w-auto" />
                                )}
                                <div className="flex justify-end">
                                    {/* <button
                                        type="button"
                                        onClick={resetForm}
                                        className="mr-2 bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded"
                                    >
                                        Cancel
                                    </button> */}
                                    <button
                                        type="submit"
                                        className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
                                    >
                                        {editingUserId ? 'Update User' : 'Add User'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </>
            ) : (
                <div className="h-full ">
                    <div className="card w-full h-screen p-4 bg-white shadow-xl text-blue-800 rounded-none ">
                        <div className="flex justify-between items-center ">
                            <h2 className="text-4xl font-bold">Users</h2>
                            <div className="flex items-center space-x-4">
                                <input
                                    type="text"
                                    placeholder="ค้นหาผู้ใช้..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="border border-gray-400 p-2 rounded  bg-white"
                                />
                                <select
                                    value={filteredRole}
                                    onChange={(e) => setFilteredRole(e.target.value)}
                                    className="border border-gray-400 p-2 rounded  bg-white"
                                >
                                    <option value="ALL">ALL Role</option>
                                    <option value="USER">USER</option>
                                    <option value="ADMIN">ADMIN</option>
                                </select>
                                <button
                                    onClick={() => setShowForm(true)}
                                    className="btn bg-green-500 text-white hover:bg-green-400 transition duration-300">
                                    <FaPlus />
                                </button>
                            </div>
                        </div>
                        <div className="divider mt-2"></div>
                        <div className="h-full w-full  overflow-x-auto flex-grow bg-white">
                            <DataTable
                                columns={columns}
                                data={filteredUsers}
                                paginationPerPage={15}
                                pagination
                                paginationRowsPerPageOptions={[5, 10, 15, 17]}
                                responsive
                                customStyles={{
                                    table: {
                                        style: {
                                            width: '100%',
                                            tableLayout: 'fixed',
                                        }
                                    },
                                    headRow: {
                                        style: {
                                            backgroundColor: '#f1f5f9',
                                        }
                                    },
                                    cells: {
                                        style: {
                                            padding: '6px',
                                            textAlign: 'center',
                                            fontSize: '14px',
                                        }
                                    },
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}
            {qrModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
                        <h2 className="text-lg font-bold mb-4 text-center">QR Code</h2>
                        <QRCodeSVG ref={contentRef} value={pinCode} size={156} className="mx-auto mb-4" />
                        <div className="flex justify-between mt-4">
                            <ReactToPrint
                                trigger={() => (
                                    <button type="button" className="flex items-center bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded">
                                        <RiPrinterLine />
                                        <span className="ml-1">Print</span>
                                    </button>
                                )}
                                content={() => contentRef.current}
                                pageStyle={`@page { size: portrait; margin: 5mm; padding: 0mm; }`}
                            />
                            <button
                                onClick={() => setQrModal(false)}
                                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>

            )}
        </div>
    );
};

export default AddUser;


