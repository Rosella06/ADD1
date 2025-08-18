import React, { useState, useEffect, useContext, ChangeEvent } from 'react';
import axios, { AxiosError } from 'axios';
import { FaPlus, FaEdit, FaTrash, FaSearch } from 'react-icons/fa';
import DataTable, { TableColumn } from 'react-data-table-component';
import Swal from 'sweetalert2';

import { resizeImage, Usercontext } from '../../constants/constants';
import { contextType } from '../../types/global.type';
import { Users } from '../../types/user.type';
import defaultImage from '../../img/user.png';
import "../../styles/styles.css";

const initialUserState = {
    userName: '',
    userPassword: '',
    displayName: '',
    userRole: 'USER',
    userStatus: true,
    userImage: null as File | null,
};

const AddUser: React.FC = () => {
    const [userForm, setUserForm] = useState(initialUserState);
    const [imagePreview, setImagePreview] = useState('');
    const [users, setUsers] = useState<Users[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingUserId, setEditingUserId] = useState<string | null>(null);
    const { userData } = useContext(Usercontext) as contextType;
    const { token } = userData;

    const [filteredRole, setFilteredRole] = useState('ALL');
    const [searchTerm, setSearchTerm] = useState('');

    const baseurl = `${import.meta.env.VITE_APP_API}/users`;

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await axios.get(baseurl, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(response.data.data.filter((u: Users) => u.id !== userData.id));
        } catch (error) {
            handleApiError(error, "ไม่สามารถโหลดข้อมูลผู้ใช้ได้");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleApiError = (error: unknown, defaultMessage: string) => {
        console.error("🔥 Error:", error);
        const message = error instanceof AxiosError ? error.response?.data.message : defaultMessage;
        Swal.fire({ icon: 'error', title: 'ผิดพลาด', text: message });
    };

    const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const selectedFile = e.target.files[0];
            resizeImage(selectedFile)
                .then(resizedFile => {
                    setImagePreview(URL.createObjectURL(resizedFile));
                    setUserForm(prev => ({ ...prev, userImage: resizedFile }));
                })
                .catch(error => console.error('Error resizing image:', error));
        }
    };

    const resetForm = () => {
        setUserForm(initialUserState);
        setImagePreview('');
        setIsEditMode(false);
        setEditingUserId(null);
        setShowForm(false);
    };

    const handleAddClick = () => {
        resetForm();
        setShowForm(true);
    };

    const handleEditClick = (user: Users) => {
        setIsEditMode(true);
        setEditingUserId(user.id);
        setUserForm({
            userName: user.userName,
            displayName: user.displayName,
            userRole: user.userRole,
            userStatus: user.userStatus,
            userPassword: '',
            userImage: null,
        });
        setImagePreview(user.userImage ? `${import.meta.env.VITE_APP_IMG}${user.userImage}` : '');
        setShowForm(true);
    };

    const handleDelete = (userId: string) => {
        Swal.fire({
            title: "คุณแน่ใจหรือไม่?",
            text: "คุณต้องการลบผู้ใช้งานนี้ใช่หรือไม่?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#6b7280",
            confirmButtonText: "ใช่, ลบเลย",
            cancelButtonText: "ยกเลิก",
        }).then(async (result) => {
            if (result.isConfirmed) {
                setLoading(true);
                try {
                    await axios.delete(`${baseurl}/${userId}`, { headers: { Authorization: `Bearer ${token}` } });
                    Swal.fire({ icon: "success", title: "ลบผู้ใช้สำเร็จ", showConfirmButton: false, timer: 1500 });
                    fetchUsers();
                } catch (error) {
                    handleApiError(error, "เกิดข้อผิดพลาดในการลบผู้ใช้");
                } finally {
                    setLoading(false);
                }
            }
        });
    };

console.log("userForm:", userForm);
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const { userName, displayName, userRole, userImage, userPassword } = userForm;

        if (!userName || !displayName || !userRole || (!isEditMode && !userPassword)) {
            Swal.fire({ icon: 'error', title: 'ผิดพลาด', text: 'กรุณากรอกข้อมูลให้ครบ' });
            return;
        }
        // if (!isEditMode && userPincode.length !== 6) {
        //     Swal.fire({ icon: 'error', title: 'ผิดพลาด', text: 'PIN ต้องมี 6 หลัก' });
        //     return;
        // }

        const formData = new FormData();
        formData.append("userName", userName);
        formData.append("displayName", displayName);
        formData.append("userRole", userRole);
        formData.append("userStatus", userForm.userStatus ? "1" : "0");

        if (!isEditMode) {
            formData.append("userPassword", userPassword);
            // formData.append("pinCode", userPincode);
        }

        if (userImage) {
            formData.append("upload", userImage); // <-- แก้ชื่อให้ตรง backend
        }

        setLoading(true);
        try {
            if (isEditMode && editingUserId) {
                await axios.put(`${baseurl}/${editingUserId}`, formData, {
                    headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" }
                });
            } else {
                await axios.post(`${import.meta.env.VITE_APP_API}/auth/register`, formData, {
                    headers: { "Content-Type": "multipart/form-data" }
                });
            }

            Swal.fire({ icon: "success", title: isEditMode ? "แก้ไขข้อมูลสำเร็จ" : "เพิ่มผู้ใช้ใหม่สำเร็จ", timer: 1500, showConfirmButton: false });
            fetchUsers();
            resetForm();
        } catch (error) {
            handleApiError(error, `เกิดข้อผิดพลาดในการ${isEditMode ? 'แก้ไข' : 'เพิ่ม'}ผู้ใช้`);
        } finally {
            setLoading(false);
        }
    };
const filteredUsers = users.filter(user =>
    (user.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     user.displayName?.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (filteredRole === 'ALL' || user.userRole === filteredRole)
);


    const columns: TableColumn<Users>[] = [
        {
            name: 'รูปภาพ', width: "120px", center: true,
            cell: item => <img src={item.userImage ? `${import.meta.env.VITE_APP_IMG}${item.userImage}` : defaultImage} alt={item.displayName} className="h-16 w-16 object-cover rounded-full my-2" />
        },
        { name: 'User Name', selector: row => row.userName, sortable: true },
        { name: 'Display Name', selector: row => row.displayName, sortable: true, grow: 2 },
        { name: 'Role', sortable: true, cell: row => <span className="font-semibold">{row.userRole}</span> },
        { name: 'Status', center: true, cell: row => <span className={`px-3 py-1 text-xs font-semibold rounded-full ${row.userStatus ? 'bg-success text-success-content' : 'bg-base-300 text-base-content'}`}>{row.userStatus ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}</span> },
        {
            name: 'จัดการ', center: true, cell: row => (
                <div className="flex space-x-2">
                    <button onClick={() => handleEditClick(row)} className="btn btn-sm btn-warning text-white"><FaEdit /></button>
                    <button onClick={() => handleDelete(row.id)} className="btn btn-sm btn-error text-white"><FaTrash /></button>
                </div>
            )
        },
    ];

    return (
        <div className="flex flex-col items-center pt-10 bg-white min-h-screen">
            {loading && (
                <div className="fixed inset-0 bg-white bg-opacity-75 flex justify-center items-center z-[100]">
                    <span className="loading loading-spinner loading-lg text-primary"></span>
                </div>
            )}
            <div className="w-full max-w-7xl mx-auto">
                <div className="p-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
                        <h2 className="text-3xl font-bold text-gray-800">จัดการผู้ใช้งาน</h2>
                        <div className="flex items-center gap-2 w-full md:w-auto">
                            <div className="relative w-full md:w-64">
                                <input type="text" placeholder="ค้นหา..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="input input-bordered w-full bg-white pl-10" />
                                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            </div>
                            <select value={filteredRole} onChange={(e) => setFilteredRole(e.target.value)} className="select select-bordered bg-white w-full md:w-auto">
                                <option value="ALL">ทุกตำแหน่ง</option>
                                <option value="USER">USER</option>
                                <option value="ADMIN">ADMIN</option>
                                <option value="PHARMACIST">PHARMACIST</option>
                            </select>
                            <button onClick={handleAddClick} className="btn btn-primary"><FaPlus /> เพิ่มผู้ใช้</button>
                        </div>
                    </div>
                    <DataTable
                        columns={columns}
                        data={filteredUsers}
                        pagination paginationPerPage={10}
                        responsive highlightOnHover
                    />
                </div>
            </div>

            {/* Modal Form */}
            {showForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
                    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transform transition-all">
                        <div className="flex justify-between items-center mb-6 pb-3 border-b">
                            <h2 className="text-2xl font-bold text-gray-800">{isEditMode ? 'แก้ไขข้อมูลผู้ใช้' : 'เพิ่มผู้ใช้ใหม่'}</h2>
                            <button type="button" onClick={resetForm} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                            {/* Image Uploader */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">รูปโปรไฟล์</label>
                                <div className="mt-2 flex items-center gap-4">
                                    <img src={imagePreview || defaultImage} alt="Preview" className="h-24 w-24 object-cover rounded-full bg-gray-100" />
                                    <label htmlFor="file-upload" className="btn btn-outline">
                                        <span>{imagePreview ? 'เปลี่ยนรูปภาพ' : 'เลือกรูปภาพ'}</span>
                                        <input id="file-upload" type="file" className="sr-only" onChange={handleFileSelect} accept="image/*" />
                                    </label>
                                </div>
                            </div>

                            <div>
                                <label className="label"><span className="label-text">User Name</span></label>
                                <input type="text" value={userForm.userName} onChange={e => setUserForm({ ...userForm, userName: e.target.value })} disabled={isEditMode} required className="input input-bordered w-full bg-white disabled:bg-gray-200" />
                            </div>
                            <div>
                                <label className="label"><span className="label-text">Display Name</span></label>
                                <input type="text" value={userForm.displayName} onChange={e => setUserForm({ ...userForm, displayName: e.target.value })} required className="input input-bordered w-full bg-white" />
                            </div>

                            {!isEditMode && (
                                <>
                                    <div>
                                        <label className="label"><span className="label-text">Password(6 digits)</span></label>
                                        <input type="password" value={userForm.userPassword} onChange={e => setUserForm({ ...userForm, userPassword: e.target.value })} required className="input input-bordered w-full bg-white" />
                                    </div>
                                    {/* <div>
                                        <label className="label"><span className="label-text">PIN Code (6 digits)</span></label>
                                        <input type="password" value={userForm.userPincode} onChange={e => setUserForm({ ...userForm, userPincode: e.target.value })} required maxLength={6} className="input input-bordered w-full bg-white" />
                                    </div> */}
                                </>
                            )}

                            <div>
                                <label className="label"><span className="label-text">User Role</span></label>
                                <select value={userForm.userRole} onChange={e => setUserForm({ ...userForm, userRole: e.target.value })} className="select select-bordered w-full bg-white">
                                    <option value="ADMIN">ADMIN</option>
                                    <option value="USER">USER</option>
                                    <option value="HEAD_PHARMACIST">HEAD_PHARMACIST</option>
                                    <option value="PHARMACIST">PHARMACIST</option>
                                    <option value="ASSISTANT">ASSISTANT</option>
                                    <option value="SUPER">SUPER</option>
                                </select>
                            </div>
                            <div>
                                <label className="label"><span className="label-text">User Status</span></label>
                                <select value={userForm.userStatus ? '1' : '0'} onChange={e => setUserForm({ ...userForm, userStatus: e.target.value === '1' })} className="select select-bordered w-full bg-white">
                                    <option value="1">เปิดใช้งาน</option>
                                    <option value="0">ปิดใช้งาน</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex items-center justify-end mt-8 pt-4 border-t gap-3">
                            {isEditMode && <button type="button" onClick={() => handleDelete(editingUserId!)} className="btn btn-error btn-outline mr-auto"><FaTrash /> ลบ</button>}
                            <button type="button" onClick={resetForm} className="btn btn-ghost">ยกเลิก</button>
                            <button type="submit" className="btn btn-success text-white">{isEditMode ? 'บันทึก' : 'เพิ่มผู้ใช้'}</button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default AddUser;
