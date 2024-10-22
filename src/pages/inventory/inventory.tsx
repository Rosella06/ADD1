import { FormEvent, useContext, useEffect, useState } from "react";
import axios, { AxiosError } from "axios";
import { Usercontext } from "../../constants/constants";
import { AxiosResponse, contextType } from "../../types/global.type";
import DataTable, { TableColumn } from 'react-data-table-component';
import Swal from "sweetalert2";
import { FaEdit, FaPlus, FaTrash } from "react-icons/fa";
import { drugstype } from "../../types/drugs";
import { machinetype } from "../../types/machinetype";
import { inventorytype } from "../../types/inventory";
import "../../styles/styles.css"
import Stock from "./Stock";


function Inventory() {
    const { userData } = useContext(Usercontext) as contextType;

    const [inventory, setInventory] = useState({
        id: '',
        InventoryPosition: 1,
        InventoryQty: 0,
        DrugId: '',
        MachineId: '',
        Min: 0,
        Max: 0
    });

    const [inventoryList, setInventoryList] = useState<inventorytype[]>([]);
    const [drugList, setDrugList] = useState<drugstype[]>([]);
    const [machine, setMachineList] = useState<machinetype[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [tab, setTab] = useState(1)

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

    const handleSubmitEdit = async (e: FormEvent) => {
        e.preventDefault();
        setErrorMessage('');
        try {
            const { id, InventoryPosition, InventoryQty, DrugId, MachineId, Max, Min } = inventory;
            if (id && InventoryPosition && InventoryQty && DrugId && MachineId && Max !== 0 && Min !== 0) {
                const inventoryBody = { InventoryPosition, InventoryQty, DrugId, MachineId, Max, Min };
                const response = await axios.put<AxiosResponse<inventorytype>>(`${baseurl}/${id}`, inventoryBody, {
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
            const { InventoryPosition, InventoryQty, DrugId, MachineId, Min, Max } = inventory;
            if (InventoryPosition && InventoryQty && DrugId && MachineId && Min !== 0 && Max !== 0) {
                const inventoryBody = { InventoryPosition, InventoryQty, DrugId, MachineId, Min, Max };
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

    // const resetForm = () => {
    //     setInventory({ id: '', InventoryPosition: 0, InventoryQty: 0, DrugId: '', MachineId: '', Min: 0, Max: 0 });
    //     setShowForm(false);
    //     setIsEditMode(false);
    // };

    const resetForm = () => {
        setInventory({
            id: '',
            InventoryPosition: 1,
            InventoryQty: 0,
            DrugId: '',
            MachineId: '',
            Min: 0,
            Max: 0
        });
        setIsEditMode(false);
        setShowForm(false);
    };
    const handleAddNew = () => {
        resetForm();
        setShowForm(true);
    };
    const deleteInventory = async (id: string) => {
        Swal.fire({
            title: "คุณต้องการลบรายหรือไม่?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "ลบ",
            cancelButtonText: "ยกเลิก",
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const response = await axios.delete<AxiosResponse<inventorytype>>(`${baseurl}/${id}`, {
                        headers: { authorization: `Bearer ${userData.token}` }
                    });

                    Swal.fire({
                        icon: "success",
                        title: response.data.message,
                        showConfirmButton: false,
                        timer: 1500,
                    });
                    fetchInventory();
                } catch (error) {
                    handleError(error);
                }
            }
        });
    };

    const editInventory = (item: inventorytype) => {
        setInventory(item);
        setIsEditMode(true);
        setShowForm(true);
    };



    const columnsInventory: TableColumn<inventorytype>[] = [
        {
            name: 'DrugName',
            selector: row => row.Drug.DrugName,
            sortable: true,
        },
        {
            name: 'DrugImage',
            selector: row => row.Drug.DrugImage || "No Image",
            sortable: true,
        },
        {
            name: 'InventoryPosition',
            selector: row => row.InventoryPosition,
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
            name: 'MachineId',
            selector: row => row.MachineId,
            sortable: true,
        },
        {
            name: 'Actions',
            cell: (item) => (
                <div className="p-3 flex space-x-2 text-2xl">
                    <button onClick={() => editInventory(item)} className="p-3 text-yellow-400 flex items-center space-x-1 text-3xl">
                        <FaEdit />
                    </button>
                    <button onClick={() => deleteInventory(item.id)} className="text-red-600 flex items-center space-x-1">
                        <FaTrash />
                    </button>
                </div>
            ),
            sortable: true,
        },
    ];

    const filteredInventoryList = inventoryList.filter(item =>
        item.Drug.DrugName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.InventoryPosition.toString().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex flex-col items-center py-0 bg-gray-100 w-full">
            {loading && <p>
                <span className="loading loading-ball loading-xs"></span>
                <span className="loading loading-ball loading-sm"></span>
                <span className="loading loading-ball loading-md"></span>
                <span className="loading loading-ball loading-lg"></span>
            </p>}

            <div className="card w-full h-screen p-4 bg-white shadow-xl text-blue-800 rounded-none">
                <div className="flex gap-2 justify-center">
                    <button
                        onClick={() => setTab(1)}
                        className={`btn ${tab === 1 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'}`} >Stock</button>
                    <button
                        onClick={() => setTab(2)}
                        className={`btn ${tab === 2 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'}`}>Inventory</button>
                </div>
                {
                    tab === 1 ? (
                        <div>
                            <Stock />
                        </div>
                    ) : (
                        <>
                            <div className="flex justify-between items-center">

                                <h2 className="text-4xl font-bold ">Inventory</h2>
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="text"
                                        placeholder="ค้นหาชื่อยา..."
                                        className="input w-full max-w-xs border-2 border-gray-300 h-12 bg-white"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                    <button
                                        // onClick={() => setShowForm(true)}
                                        onClick={handleAddNew}
                                        className="btn bg-green-500 text-white hover:bg-green-400 transition duration-300 h-12 flex items-center"
                                    >
                                        <FaPlus />
                                    </button>
                                </div>
                            </div>

                            <div className="divider mt-2"></div>
                            <div className="h-full w-full overflow-x-auto flex-grow bg-white text-black">
                                <DataTable
                                    columns={columnsInventory}
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
                                                padding: '8px',
                                                textAlign: 'center',
                                                fontSize: '14px',
                                            }
                                        },
                                    }}
                                />
                            </div>
                        </>
                    )
                }

                {showForm && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
                        <div className="bg-white p-6 rounded shadow-lg w-full max-w-lg">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-2xl font-bold text-center mb-4">{isEditMode ? "Edit" : "ADD"}</h2>
                                {errorMessage && <p className="text-red-500 mb-2">{errorMessage}</p>}
                                <button
                                    onClick={() => setShowForm(false)}
                                    className="text-red-500 font-bold"
                                >
                                    ✕
                                </button>
                            </div>
                            <form onSubmit={isEditMode ? handleSubmitEdit : handleSubmit}>
                                {!isEditMode && (
                                    <>
                                        <div className="flex flex-col mb-4">
                                            <label htmlFor="InventoryPosition" className="mb-2 text-sm font-medium text-gray-900">InventoryPosition</label>
                                            <input
                                                type="text"
                                                id="InventoryPosition"
                                                value={inventory.InventoryPosition}
                                                onChange={(e) => setInventory({ ...inventory, InventoryPosition: Number(e.target.value) })}
                                                required
                                                className="p-2 border border-gray-300 rounded bg-white text-zinc-700"
                                            />
                                        </div>
                                        <div className="flex flex-col mb-4">
                                            <label htmlFor="InventoryQty" className="block text-sm font-medium text-gray-900">InventoryQty</label>
                                            <input
                                                type="number"
                                                id="InventoryQty"
                                                value={inventory.InventoryQty}
                                                onChange={(e) => setInventory({ ...inventory, InventoryQty: Number(e.target.value) })}
                                                required
                                                className="p-2 border border-gray-300 rounded bg-white text-zinc-700"
                                            />
                                        </div>
                                    </>
                                )}
                                <div className="mb-4 flex space-x-4">
                                    <div className="flex-1">
                                        <label htmlFor="Min" className="block text-sm font-medium text-gray-900">Min</label>
                                        <input
                                            type="number"
                                            id="Min"
                                            value={inventory.Min}
                                            onChange={(e) => setInventory({ ...inventory, Min: Number(e.target.value) })}
                                            required
                                            min={0}
                                            max={inventory.Max}
                                            className="p-2 border border-gray-300 rounded bg-white text-zinc-700 w-full"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <label htmlFor="Max" className="block text-sm font-medium text-gray-900">Max</label>
                                        <input
                                            type="number"
                                            id="Max"
                                            value={inventory.Max}
                                            onChange={(e) => setInventory({ ...inventory, Max: Number(e.target.value) })}
                                            required
                                            min={inventory.Min}
                                            max={15}
                                            className="p-2 border border-gray-300 rounded bg-white text-zinc-700 w-full"
                                        />
                                    </div>
                                </div>
                                <div className="flex flex-col mb-4">
                                    <label htmlFor="DrugId" className="mb-2 text-sm font-medium text-gray-900">DrugName</label>
                                    <select
                                        id="DrugId"
                                        value={inventory.DrugId}
                                        onChange={(e) => setInventory({ ...inventory, DrugId: e.target.value })}
                                        required
                                        className="p-2 border border-gray-300 rounded bg-white text-zinc-700"
                                    >
                                        <option value="">เลือกยา</option>
                                        {drugList.map(drug => (
                                            <option key={drug.id} value={drug.id}>{drug.DrugName}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex flex-col mb-4">
                                    <label htmlFor="MachineId" className="mb-2 text-sm font-medium text-gray-900">MachineName</label>
                                    <select
                                        id="MachineId"
                                        value={inventory.MachineId}
                                        onChange={(e) => setInventory({ ...inventory, MachineId: e.target.value })}
                                        required
                                        className="p-2 border border-gray-300 rounded bg-white text-zinc-700"
                                    >
                                        <option value="">เลือกเครื่อง</option>
                                        {machine.map(machine => (
                                            <option key={machine.id} value={machine.id}>{machine.MachineName}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex justify-end space-x-4">
                                    {/* <button type="button" onClick={() => setShowForm(false)} className="mr-2 bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded">Cancel</button> */}
                                    <button type="submit" className="btn bg-green-500 text-white hover:bg-green-600 transition duration-300">{isEditMode ? "Update" : "Add"}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}


export default Inventory;
