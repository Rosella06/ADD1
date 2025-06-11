import { FormEvent, useContext, useEffect, useState } from "react";
import axios, { AxiosError } from "axios";
import { Usercontext } from "../../constants/constants";
import { AxiosResponse, contextType } from "../../types/global.type";
import DataTable, { TableColumn } from 'react-data-table-component';
import Swal from "sweetalert2";
import { drugstype } from "../../types/drugs";
import { machinetype } from "../../types/machinetype";
import { inventorytype } from "../../types/inventory";
import "../../styles/styles.css";

function Refill() {
    const { userData } = useContext(Usercontext) as contextType;
    const [inventory, setInventory] = useState<inventorytype>();
    const [inventoryList, setInventoryList] = useState<inventorytype[]>([]);
    const [, setDrugList] = useState<drugstype[]>([]);
    const [, setMachineList] = useState<machinetype[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');


    const baseurl = `${import.meta.env.VITE_APP_API}/inventory`;

    const fetchData = async () => {
        try {
            setLoading(true);
            await Promise.all([fetchInventory(), fetchDrugList(), fetchMachineList()]);
        } catch (error) {
            handleError(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchInventory = async () => {
        try {
            const response = await axios.get<AxiosResponse<inventorytype[]>>(baseurl, {
                headers: { authorization: `Bearer ${userData.token}` },
            });
            setInventoryList(response.data.data);
        } catch (error) {
            handleError(error);
        }
    };


    const fetchDrugList = async () => {
        try {
            const response = await axios.get<AxiosResponse<drugstype[]>>(`${import.meta.env.VITE_APP_API}/drugs`, {
                headers: { Authorization: `Bearer ${userData.token}` }
            });
            setDrugList(response.data.data);
        } catch (error) {
            handleError(error);
        }
    };

    const fetchMachineList = async () => {
        try {
            const response = await axios.get<AxiosResponse<machinetype[]>>(`${import.meta.env.VITE_APP_API}/machine`, {
                headers: { Authorization: `Bearer ${userData.token}` }
            });
            setMachineList(response.data.data);
        } catch (error) {
            handleError(error);
        }
    };

    const handleError = (error: unknown) => {
        if (error instanceof AxiosError) {
            setErrorMessage(error.response?.data.message || "เกิดข้อผิดพลาด");
        } else {
            setErrorMessage("เกิดข้อผิดพลาด");
        }
    };


    useEffect(() => {
        fetchData();
    }, []);


    const editStock = (item: inventorytype) => {
        setInventory(item);
        setIsEditMode(true);
        setShowForm(true);
    };

    const handleSubmitEdit = async (e: FormEvent) => {
        e.preventDefault();
        setErrorMessage('');

        try {
            const { InventoryQty, id, Drug } = inventory || {};

            if (InventoryQty) {
                const inventoryBody = { InventoryQty };
                const requestUrl = `${baseurl}/stock/${id}`;

                const response = await axios.put<AxiosResponse<inventorytype>>(requestUrl, inventoryBody, {
                    headers: { authorization: `Bearer ${userData.token}` },
                });

                Swal.fire({
                    icon: "success",
                    title: response.data.message,
                    showConfirmButton: false,
                    timer: 1500,
                });
                fetchInventory();
                resetForm();
            } else {
                showError("กรุณากรอกข้อมูลให้ครบ");
            }
        } catch (error) {
            handleError(error);
        }
    };



    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setErrorMessage('');
        try {
            const { InventoryPosition, InventoryQty } = inventory || {};
            if (InventoryPosition && InventoryQty) {
                const inventoryBody = { InventoryPosition, InventoryQty };
                const response = await axios.post<AxiosResponse<inventorytype>>(baseurl, inventoryBody, {
                    headers: { authorization: `Bearer ${userData.token}` },
                });
                fetchInventory();
                resetForm();
                Swal.fire({
                    icon: "success",
                    title: response.data.message,
                    showConfirmButton: false,
                    timer: 1500,
                });
            } else {
                showError("กรุณากรอกข้อมูลให้ครบ");
            }
        } catch (error) {
            handleError(error);
        }
    };

    const showError = (message: string) => {
        Swal.fire({
            icon: "error",
            title: message,
            showConfirmButton: false,
            timer: 1500,
        });
    };

    const resetForm = () => {
        setInventory(undefined);
        setShowForm(false);
        setIsEditMode(false);
    };

    // const deleteInventory = async (id: string) => {
    //     Swal.fire({
    //         title: "คุณต้องการลบรายการคลังสินค้าหรือไม่?",
    //         icon: "warning",
    //         showCancelButton: true,
    //         confirmButtonColor: "#d33",
    //         cancelButtonColor: "#3085d6",
    //         confirmButtonText: "ลบ",
    //         cancelButtonText: "ยกเลิก",
    //     }).then(async (result) => {
    //         if (result.isConfirmed) {
    //             try {
    //                 const response = await axios.delete<AxiosResponse<inventorytype>>(`${baseurl}/${id}`, {
    //                     headers: { authorization: resetForm`Bearer ${userData.token}` }
    //                 });

    //                 Swal.fire({
    //                     icon: "success",
    //                     title: response.data.message,
    //                     showConfirmButton: false,
    //                     timer: 1500,
    //                 });
    //                 fetchInventory();
    //             } catch (error) {
    //                 handleError(error);
    //             }
    //         }
    //     });
    // };

    const filteredInventoryList = inventoryList.filter(item =>
        item.Drug.DrugName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const columnsStock: TableColumn<inventorytype>[] = [
      
        {
            name: 'InventoryPosition',
            selector: row => row.InventoryPosition,
            sortable: true,
        },
          {
            name: 'DrugName',
            selector: row => row.Drug.DrugName,
            sortable: true,
        },
        {
            name: 'InventoryQty',
            selector: row => row.InventoryQty,
            sortable: true,
        },
         {
            name: 'Min',
            selector: row => row.Min,
            sortable: true,
        },
        {
            name: 'Max',
            selector: row => row.Max,
            sortable: true,
        },
        {
            name: 'Actions',
            cell: (item) => (
                <div className="p-3 flex space-x-2 text-2xl">
                    <button onClick={() => editStock(item)} className="btn bg-green-500 text-white hover:bg-green-400 transition duration-300 h-12 flex items-center">
                        เติมยา
                    </button>
                    {/* <button onClick={() => deleteInventory(item.id)} className="text-red-600 flex items-center space-x-1">
                        <FaTrash />
                    </button> */}
                </div>
            ),
            sortable: true,
        },
    ];

    return (
        <div>
            <div className="card w-full h-screen p-4 bg-white shadow-xl text-blue-800 rounded-none">
                <div className="flex justify-between items-center">
                    <h2 className="text-4xl font-bold">Stock</h2>
                    <div className="flex items-center space-x-2">
                        <input
                            type="text"
                            placeholder="ค้นหาชื่อยา..."
                            className="input w-full max-w-xs border-2 border-gray-300 h-12 bg-white"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <div className="divider mt-2"></div>
                <div className="h-full w-full overflow-x-auto flex-grow bg-white text-black">
                    <DataTable
                        columns={columnsStock}
                        data={filteredInventoryList}
                        paginationPerPage={15}
                        pagination
                        paginationRowsPerPageOptions={[6, 10, 15, 20]}
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
                                    padding: '10px',
                                    borderBottom: '1px solid #e5e7eb',
                                }
                            }
                        }}
                    />
                </div>
                {showForm && (
                    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center z-50">
                        <div className="bg-white p-6 rounded-lg shadow-lg w-full md:w-1/2 ">

                            <form onSubmit={isEditMode ? handleSubmitEdit : handleSubmit}>
                                {/* {errorMessage && <p className="text-red-500 mb-2">{errorMessage}</p>} */}
                                <div className="flex flex-col mb-4">
                                    <label className="text-2xl font-bold text-black text-center  p-4">ชื่อยา: {inventory?.Drug.DrugName}</label>
                                    <div className="flex justify-center items-center space-x-2">
                                        <input
                                            type=""
                                            value={inventory?.InventoryQty}
                                            onChange={(e) => {
                                                if (inventory) {
                                                    setInventory({
                                                        ...inventory,
                                                        InventoryQty: Number(e.target.value),
                                                    });
                                                }
                                            }}
                                            className="w-20 p-2 border border-gray-300 rounded text-center bg-white text-black"
                                            required
                                            min={0}
                                            max={inventory?.Max}
                                        />

                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (inventory) {
                                                    if (inventory.InventoryQty < inventory.Max) {
                                                        setInventory({
                                                            ...inventory,
                                                            InventoryQty: inventory.InventoryQty + 1,
                                                        });
                                                    } else {
                                                        // แสดงข้อความเตือนเมื่อถึง Max
                                                        Swal.fire({
                                                            icon: 'warning',
                                                            title: 'ยาเต็มแล้ว',
                                                            text: 'คุณไม่สามารถเพิ่มจำนวนยาได้เนื่องจากถึงจำนวนสูงสุดแล้ว',
                                                            showConfirmButton: true,
                                                            confirmButtonText: 'ตกลง',
                                                        });
                                                    }
                                                }
                                            }}
                                            className="w-10 h-10 flex items-center justify-center bg-blue-500 text-white text-2xl rounded-full hover:bg-blue-600 shadow-md"
                                        >
                                            +
                                        </button>

                                    </div>

                                </div>
                                <div className="flex justify-center gap-1">
                                    <button
                                        type="submit"
                                        className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
                                    >
                                        {isEditMode ? "Refill" : "Add"}
                                    </button>
                                    <button
                                        type="button"
                                        className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded"
                                        onClick={resetForm}
                                    >
                                        Cancel
                                    </button>


                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Refill;
