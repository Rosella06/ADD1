import { ChangeEvent, FormEvent, useContext, useEffect, useState } from "react";
import axios, { AxiosError } from "axios";
import DataTable, { TableColumn } from 'react-data-table-component';
import Swal from "sweetalert2";
import { FaEdit,  FaPlus, FaSearch, FaTrash } from "react-icons/fa";

import { resizeImage, Usercontext } from "../../constants/constants";
import { AxiosResponse, contextType } from "../../types/global.type";
import { drugstype } from "../../types/drugs";
import defaultImage from '../../img/no-drugs.png'; 
import "../../styles/styles.css";

// State เริ่มต้นสำหรับฟอร์ม
const initialDrugState = {
    id: '',
    drugName: '',
    drugImage: null as File | null
};

function Druges() {
    const { userData } = useContext(Usercontext) as contextType;
    const [drugs, setDrugs] = useState(initialDrugState);
    const [drugList, setDrugList] = useState<drugstype[]>([]);
    const [drugImgPreview, setDrugImgPreview] = useState<string>('');
    const [showForm, setShowForm] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    const baseurl = `${import.meta.env.VITE_APP_API}/drugs`;

    // --- Data Fetching ---
    const fetchDrugs = async () => {
        setLoading(true);
        try {
            const response = await axios.get<AxiosResponse<drugstype[]>>(baseurl, {
                headers: { authorization: `Bearer ${userData.token}` }
            });
            setDrugList(response.data.data);
        } catch (error) {
            handleApiError(error, "ไม่สามารถโหลดข้อมูลยาได้");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDrugs();
    }, []);

    // --- Handlers ---
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
                    // สร้าง URL สำหรับ Preview
                    setDrugImgPreview(URL.createObjectURL(resizedFile));
                    setDrugs({ ...drugs, drugImage: resizedFile });
                })
                .catch(error => console.error('Error resizing image:', error));
        }
    };
    
    const resetForm = () => {
        setDrugs(initialDrugState);
        setDrugImgPreview('');
        setIsEditMode(false);
        setShowForm(false);
    }   

    const handleAddClick = () => {
        resetForm();
        setShowForm(true);
    };

    const handleEditClick = (drugData: drugstype) => {
        setIsEditMode(true);
        setDrugs({
            id: drugData.id,
            drugName: drugData.drugName,
            drugImage: null 
        });
        setDrugImgPreview(drugData.drugImage ? `${import.meta.env.VITE_APP_IMG}${drugData.drugImage}` : '');
        setShowForm(true);
    };

    const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!drugs.id || !drugs.drugName) {
        Swal.fire({ icon: "warning", title: 'ข้อมูลไม่ครบ', text: 'กรุณากรอกรหัสยาและชื่อยา' });
        return;
    }

    const formData = new FormData();
    formData.append('drugCode', drugs.id);
    formData.append('drugName', drugs.drugName);
    if (drugs.drugImage) formData.append('upload', drugs.drugImage);

    const requestConfig = {
        headers: {
            authorization: `Bearer ${userData.token}`
        }
    };

    try {
        const action = isEditMode
            ? axios.put(`${baseurl}/${drugs.id}`, formData, requestConfig)
            : axios.post(baseurl, formData, requestConfig);

        await action;

        Swal.fire({
            icon: "success",
            title: isEditMode ? "แก้ไขข้อมูลยาสำเร็จ" : "เพิ่มยาใหม่สำเร็จ",
            showConfirmButton: false,
            timer: 1500
        });

        fetchDrugs();
        resetForm();

    } catch (error) {
        handleApiError(error, `เกิดข้อผิดพลาดในการ${isEditMode ? 'แก้ไข' : 'เพิ่ม'}ยา`);
    }
};

    
   const handleDelete = (drugId: string) => {
    Swal.fire({
        title: "คุณแน่ใจหรือไม่?",
        text: `คุณต้องการลบยาใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#6b7280",
        confirmButtonText: "ใช่, ลบเลย",
        cancelButtonText: "ยกเลิก",
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                await axios.delete(`${baseurl}/${drugId}`, {
                    headers: { authorization: `Bearer ${userData.token}` }
                });
                Swal.fire({ icon: "success", title: "ลบสำเร็จ!", showConfirmButton: false, timer: 1500 });
                fetchDrugs();
                resetForm();
            } catch (error) {
                handleApiError(error, "เกิดข้อผิดพลาดในการลบยา");
            }
        }
    });
};


    // --- Table & Filtering ---
    const filteredDrugs = drugList.filter(drug =>
        drug.drugName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        drug.drugCode.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const columns: TableColumn<drugstype>[] = [
        {
            name: 'รูปภาพ', width: "150px", center: true,
            cell: item => (
                <img
                    src={item.drugImage ? `${import.meta.env.VITE_APP_IMG}${item.drugImage}` : defaultImage}
                    alt={item.drugName}
                    className="h-16 w-28 object-contain my-2 p-1 rounded-md bg-gray-100"
                />
            ),
        },
        { name: 'รหัสยา', selector: row => row.drugCode, sortable: true, width: "150px" },
        { name: 'ชื่อยา', selector: row => row.drugName, sortable: true, grow: 2 },
        {
            name: 'จัดการ', center: true,
            cell: item => (
                <div className="flex space-x-2">
                    <button onClick={() => handleEditClick(item)} className="btn btn-sm btn-warning text-white">
                        <FaEdit /> แก้ไข
                    </button>
                    <button onClick={() => handleDelete(item.drugCode)} className="btn btn-sm btn-error text-white">
                        <FaTrash /> ลบ
                    </button>
                </div>
            ),
        },
    ];

    return (
        <div className="flex flex-col items-center pt-10  bg-white min-h-screen">
            {loading && (
                <div className="fixed inset-0 bg-white bg-opacity-75 flex justify-center items-center z-[100]">
                    <span className="loading loading-spinner loading-lg text-blue-600"></span>
                </div>
            )}
            <div className="w-full max-w-7xl mx-auto ">
                <div className="p-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
                        <h2 className="text-3xl font-bold text-gray-800">จัดการข้อมูลยา</h2>
                        <div className="flex items-center gap-2 w-full md:w-auto">
                            <div className="relative w-full md:w-80">
                                <input
                                    type="text"
                                    placeholder="ค้นหาชื่อยา หรือรหัสยา..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="input input-bordered w-full bg-white pl-10"
                                />
                                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                            </div>
                            <button onClick={handleAddClick} className="btn btn-primary">
                                <FaPlus /> เพิ่มยา
                            </button>
                        </div>
                    </div>
                    <DataTable
                        columns={columns}
                        data={filteredDrugs}
                        pagination paginationPerPage={10}
                        paginationRowsPerPageOptions={[10, 15, 20]}
                        responsive highlightOnHover
                    />
                </div>
            </div>

            {/* Modal Form */}
            {showForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
                    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-lg transform transition-all">
                        <div className="flex justify-between items-center mb-6 pb-3 border-b">
                            <h2 className="text-2xl font-bold text-gray-800">
                                {isEditMode ? "แก้ไขข้อมูลยา" : "เพิ่มยาใหม่"}
                            </h2>
                            <button type="button" onClick={resetForm} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
                        </div>
                        
                        <div className="space-y-4">
                            {/* Image Uploader */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">รูปภาพ</label>
                                <div className="mt-2 flex justify-center items-center w-full h-48 border-2 border-gray-300 border-dashed rounded-lg p-2">
                                    <div className="text-center">
                                        <img src={drugImgPreview || defaultImage} alt="Preview" className="mx-auto h-32 object-contain"/>
                                        <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 mt-2">
                                            <span>{drugImgPreview ? 'เปลี่ยนรูปภาพ' : 'เลือกรูปภาพ'}</span>
                                            <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileSelect} accept="image/*" />
                                        </label>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Drug Code */}
                            <div>
                                <label htmlFor="drugId" className="block text-sm font-medium text-gray-700">รหัสยา (ID)</label>
                                <input
                                    type="text"
                                    id="drugId"
                                    value={drugs.id}
                                    onChange={(e) => setDrugs({ ...drugs, id: e.target.value })}
                                    disabled={isEditMode}
                                    className="input input-bordered w-full bg-white mt-1 disabled:bg-gray-200 disabled:text-gray-500"
                                    required
                                />
                                {isEditMode && <p className="text-xs text-gray-500 mt-1">รหัสยาไม่สามารถแก้ไขได้</p>}
                            </div>
                            
                            {/* Drug Name */}
                            <div>
                                <label htmlFor="DrugName" className="block text-sm font-medium text-gray-700">ชื่อยา</label>
                                <input
                                    type="text"
                                    id="DrugName"
                                    value={drugs.drugName}
                                    onChange={(e) => setDrugs({ ...drugs, drugName: e.target.value })}
                                    className="input input-bordered w-full bg-white mt-1"
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-end mt-8 pt-4 border-t gap-3">
                            {isEditMode && (
                                <button type="button" onClick={() => handleDelete(drugs.id)} className="btn btn-error btn-outline mr-auto">
                                    <FaTrash /> ลบรายการนี้
                                </button>
                            )}
                            <button type="button" onClick={resetForm} className="btn btn-ghost">ยกเลิก</button>
                            <button type="submit" className="btn btn-success text-white">
                                {isEditMode ? "บันทึกการเปลี่ยนแปลง" : "เพิ่มยา"}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}

export default Druges;