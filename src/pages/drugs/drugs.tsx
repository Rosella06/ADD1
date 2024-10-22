import { ChangeEvent, FormEvent, useContext, useEffect, useState } from "react";
import { drugstype } from "../../types/drugs";
import axios, { AxiosError } from "axios";
import { resizeImage, Usercontext } from "../../constants/constants";
import { AxiosResponse, contextType } from "../../types/global.type";
import DataTable, { TableColumn } from 'react-data-table-component';
import Swal from "sweetalert2";
import { FaEdit, FaPlus, FaTrash } from "react-icons/fa";
import "../../styles/styles.css"
import defaultImage from '../../img/no-drugs.png'


function Druges() {
    const [drugs, setDrugs] = useState({
        id: '',
        DrugName: '',
        DrugImage: null as File | null
    });
    const [selectedDrug, setSelectedDrug] = useState<drugstype | null>(null);
    const [drugImg, setDrugImg] = useState('');
    const { userData } = useContext(Usercontext) as contextType;
    const [drugList, setDrugList] = useState<drugstype[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchDrugs = async () => {
        try {
            const response = await axios.get<AxiosResponse<drugstype[]>>(`${import.meta.env.VITE_APP_API}/drugs`, {
                headers: { authorization: `Bearer ${userData.token}` }
            });
            setDrugList(response.data.data);
        } catch (error) {
            if (error instanceof AxiosError) {
                console.error(error.response?.data.message);
            } else {
                console.error(error);
            }
        }
    };

    useEffect(() => {
        fetchDrugs();
    }, []);

    const fileSelect = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const selectedFile = e.target.files[0];
            resizeImage(selectedFile)
                .then((resizedFile) => {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        setDrugImg(reader.result as string);
                    };
                    reader.readAsDataURL(resizedFile);
                    setDrugs({ ...drugs, DrugImage: resizedFile });
                })
                .catch((error) => {
                    console.error('Error resizing image:', error);
                });
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        const baseurl = `${import.meta.env.VITE_APP_API}/drugs`;

        try {
            const { id, DrugImage, DrugName } = drugs;
            if (id !== '' && DrugName !== '') {
                const formData = new FormData();
                formData.append('id', id);
                formData.append('DrugName', DrugName);

                if (DrugImage) {
                    formData.append('fileupload', DrugImage);
                }

                if (isEditMode && selectedDrug) {
                    await axios.put<AxiosResponse<drugstype>>(`${baseurl}/${selectedDrug.id}`, formData, {
                        headers: {
                            Accept: "application/json",
                            "Content-Type": "multipart/form-data",
                            authorization: `Bearer ${userData.token}`
                        }
                    });
                } else {
                    await axios.post<AxiosResponse<drugstype>>(baseurl, formData, {
                        headers: {
                            Accept: "application/json",
                            "Content-Type": "multipart/form-data",
                            authorization: `Bearer ${userData.token}`
                        }
                    });
                }

                fetchDrugs();
                setDrugs({
                    id: '',
                    DrugName: '',
                    DrugImage: null
                });
                setDrugImg('');
                setShowForm(false);
                setIsEditMode(false);

                Swal.fire({
                    icon: "success",
                    title: isEditMode ? "แก้ไขรายการยาเรียบร้อย" : "เพิ่มรายการยาเรียบร้อย",
                    showConfirmButton: false,
                    timer: 1500
                });
            } else {
                Swal.fire({
                    icon: "warning",
                    title: 'กรุณากรอกข้อมูลให้ครบ',
                    showConfirmButton: false,
                    timer: 1500
                });
            }

        } catch (error) {
            console.error('Error:', error);
        }
    };

    const deletedrug = async (id: string) => {
        Swal.fire({
            title: "คุณต้องการลบรายการหรือไม่?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "ลบ",
            cancelButtonText: "ยกเลิก",
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const response = await axios.delete<AxiosResponse<drugstype>>(`${import.meta.env.VITE_APP_API}/drugs/${id}`, {
                        headers: { authorization: `Bearer ${userData.token}` }
                    });
                    Swal.fire({
                        icon: "success",
                        title: response.data.message,
                        showConfirmButton: false,
                        timer: 1500,
                    });
                    fetchDrugs();
                } catch (error) {
                    if (error instanceof AxiosError) {
                        console.error(error.response?.data.message);
                    } else {
                        console.error(error);
                    }
                }
            }
        });
    };

    const editDrug = (drug: drugstype) => {
        setSelectedDrug(drug);
        setDrugs({
            id: drug.id,
            DrugName: drug.DrugName,
            DrugImage: null
        });
        setDrugImg(`${import.meta.env.VITE_APP_IMG}${drug.DrugImage}`);
        setIsEditMode(true);
        setShowForm(true);
    };

    const columns: TableColumn<drugstype>[] = [
        {
            name: 'DrugImage',
            cell: (item) => (
                <img 
                    src={item.DrugImage && item.DrugImage.trim() !== "" ? `${import.meta.env.VITE_APP_IMG}${item.DrugImage}` : defaultImage} 
                    alt="drugsimg" 
                    className="rounded-md text-center object-contain h-20 w-60" 
                />
            ),
            sortable: true,
        },
        {
            name: 'id',
            selector: row => row.id,
            sortable: true,
        },
        {
            name: 'DrugName',
            selector: row => row.DrugName,
            sortable: true,
        },
        {
            name: 'Actions',
            cell: (item) => (
                <div className="p-3 flex space-x-2 text-2xl  ">
                    <button onClick={() => editDrug(item)} className=" text-yellow-400  flex items-center space-x-1 transition duration-300 text-3xl">
                        <FaEdit />
                    </button>
                    <button onClick={() => deletedrug(item.id)} className=" p-4 text-red-600 flex items-center space-x-1 transition duration-300">
                        <FaTrash />
                    </button>
                </div>
            ),
            sortable: true,
        },
    ];
    const handleSearch = (searchTerm: string) => {
        if (searchTerm.trim() === '') {
            fetchDrugs();
        } else {
            const filteredDrugs = drugList.filter(drug =>
                drug.DrugName.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setDrugList(filteredDrugs);
        }
    };


    return (
        <div className="flex flex-col items-center  py-0 bg-gray-100 ">
            <div className="card w-full h-screen p-4 bg-white shadow-xl text-blue-800 rounded-none">
                <div className="flex justify-between items-center">
                    <div className="text-4xl font-bold">Drug</div>
                    <div className="flex items-center">
                        <input
                            type="text"
                            placeholder="ค้นหาชื่อยา..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                handleSearch(e.target.value);
                            }}
                            className="input border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 rounded-lg mr-2 bg-white"
                        />
                        <button onClick={() => {
                            setShowForm(true);
                            setIsEditMode(false);
                        }} className="btn bg-green-500 text-white hover:bg-green-400 transition duration-300">
                            <FaPlus />
                        </button>
                    </div>
                </div>

                <div className="divider mt-2"></div>
                <div className="h-full w-full  overflow-x-auto flex-grow bg-white">
                    <DataTable
                        columns={columns}
                        data={drugList}
                        paginationPerPage={15}
                        pagination
                        paginationRowsPerPageOptions={[5, 10, 15, 20]}
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
                                    padding: '8px',
                                    textAlign: 'center',
                                    fontSize: '14px',
                                }
                            },
                        }}
                    />
                </div>
            </div>
            {showForm && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded shadow-lg w-full max-w-lg">
                        <div className="flex justify-between items-center mb-2">
                        <h2 className="text-2xl font-bold text-center mb-4 text-blue-800">
                            {isEditMode ? "Edit Drug" : "ADD Drug"}</h2>
                   
                                <button
                                    onClick={() => setShowForm(false)}
                                    className="text-red-500 font-bold"
                                >
                                    ✕
                                </button>
                            </div>
                      
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="flex flex-col ">
                                <label htmlFor="id" className="block text-sm font-medium text-gray-900">id</label>
                                <input
                                    type="text"
                                    id="id"
                                    value={drugs.id}
                                    onChange={(e) => setDrugs({ ...drugs, id: e.target.value })}
                                    className="p-2 border border-gray-300 rounded bg-white text-zinc-700"
                                    required
                                />
                            </div>
                            <div className="flex flex-col">
                                <label htmlFor="DrugName" className="block text-sm font-medium text-gray-900">DrugName</label>
                                <input
                                    type="text"
                                    id="DrugName"
                                    value={drugs.DrugName}
                                    onChange={(e) => setDrugs({ ...drugs, DrugName: e.target.value })}
                                    className="p-2 border border-gray-300 rounded bg-white text-zinc-700"
                                    required
                                />
                            </div>
                            <div className="flex flex-col">
                                <label htmlFor="DrugImage" className="block text-sm font-medium text-gray-900">เลือกรูปภาพ:</label>
                                <input
                                    type="file"
                                    onChange={fileSelect}
                                    className=" border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 rounded-lg p-2 text-black"
                                />
                            </div>
                            {drugImg && <img src={drugImg} alt="Preview" className="my-4 rounded-md object-cover h-32 w-32" />}
                            <div className="flex justify-end space-x-4">
                                {/* <button type="button" onClick={() => setShowForm(false)} className="mr-2 bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded">Cancel</button> */}
                                <button type="submit" className="btn bg-green-500 text-white hover:bg-green-600 transition duration-300">{isEditMode ? "Update" : "Add"}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Druges;
