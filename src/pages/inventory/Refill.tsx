import { FormEvent, useContext, useEffect, useState } from "react";
import axios, { AxiosError } from "axios";
import { Usercontext } from "../../constants/constants";
import { AxiosResponse, contextType } from "../../types/global.type";
import DataTable, { TableColumn } from "react-data-table-component";
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
    const [isRefillConfirmed, setIsRefillConfirmed] = useState(false);
    const [, setLoading] = useState(true);
    const [, setErrorMessage] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [inputValue, setInputValue] = useState("");
    const [isNewInput, setIsNewInput] = useState(true);

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

    useEffect(() => {
        fetchData();
    }, []);

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

    useEffect(() => {
        if (inventory) {
            const qty = parseInt(inputValue || "0", 10);
            if (!isNaN(qty)) {
                setInventory({
                    ...inventory,
                    InventoryQty: qty,
                });
            }
        }
    }, [inputValue]);

    const fetchDrugList = async () => {
        try {
            const response = await axios.get<AxiosResponse<drugstype[]>>(`${import.meta.env.VITE_APP_API}/drugs`, {
                headers: { Authorization: `Bearer ${userData.token}` },
            });
            setDrugList(response.data.data);
        } catch (error) {
            handleError(error);
        }
    };

    const fetchMachineList = async () => {
        try {
            const response = await axios.get<AxiosResponse<machinetype[]>>(`${import.meta.env.VITE_APP_API}/machine`, {
                headers: { Authorization: `Bearer ${userData.token}` },
            });
            setMachineList(response.data.data);
        } catch (error) {
            handleError(error);
        }
    };

    const handleError = (error: unknown) => {
        const message =
            error instanceof AxiosError
                ? error.response?.data.message || "เกิดข้อผิดพลาด"
                : "เกิดข้อผิดพลาด";

        setErrorMessage(message);
        Swal.fire({
            icon: "error",
            title: message,
            showConfirmButton: false,
            timer: 1500,
        });
    };

    const editStock = (item: inventorytype) => {
        setInventory(item);
        setInputValue(item.InventoryQty.toString());
        setIsNewInput(true);
        setIsRefillConfirmed(false);
        setShowForm(true);
    };

    const handleSubmitEdit = async (e: FormEvent) => {
        e.preventDefault();
        setErrorMessage("");

        try {
            const { InventoryQty, id, InventoryFloor, InventoryPosition } = inventory || {};

            if (InventoryQty !== undefined && InventoryFloor !== undefined && InventoryPosition !== undefined) {
                const machineId = localStorage.getItem("selectedMachineId");
                if (!machineId) return showError("ไม่พบ selectedMachineId กรุณาเลือกเครื่องก่อน");

                const inventoryBody = { InventoryQty };
                const requestUrl = `${baseurl}/stock/${id}`;
                await axios.put<AxiosResponse<inventorytype>>(requestUrl, inventoryBody, {
                    headers: { authorization: `Bearer ${userData.token}` },
                });

                await axios.post(
                    `${import.meta.env.VITE_APP_API}/plc/sendM`,
                    {
                        command: "M32",
                        floor: InventoryFloor,
                        position: Number(InventoryPosition),
                        qty: InventoryQty,
                        machineId,
                    },
                    {
                        headers: { authorization: `Bearer ${userData.token}` },
                    }
                );

                fetchInventory();
            } else {
                showError("กรุณากรอกข้อมูลให้ครบ");
            }
        } catch (error) {
            handleError(error);
        }
    };

    const sendM33Command = async (item: inventorytype) => {
        try {
            const machineId = localStorage.getItem("selectedMachineId");
            if (!machineId) return showError("ไม่พบ selectedMachineId กรุณาเลือกเครื่องก่อน");

            await axios.post(
                `${import.meta.env.VITE_APP_API}/plc/sendM`,
                {
                    command: "m33",
                    machineId,
                    inventoryId: item.id,
                },
                {
                    headers: { authorization: `Bearer ${userData.token}` },
                }
            );

            fetchInventory();
            resetForm();
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
        setIsRefillConfirmed(false);
    };

    const filteredInventoryList = inventoryList.filter((item) =>
        item.Drug.DrugName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const columnsStock: TableColumn<inventorytype>[] = [
        { name: "InventoryFloor", selector: (row) => row.InventoryFloor, sortable: true },
        { name: "InventoryPosition", selector: (row) => row.InventoryPosition, sortable: true },
        { name: "DrugName", selector: (row) => row.Drug.DrugName, sortable: true },
        { name: "InventoryQty", selector: (row) => row.InventoryQty, sortable: true },
        { name: "Min", selector: (row) => row.Min, sortable: true },
        { name: "Max", selector: (row) => row.Max, sortable: true },
        {
            name: "Actions",
            cell: (item) => (
                <button
                    onClick={() => editStock(item)}
                    className="btn bg-sky-400 text-white hover:bg-cyan-500 transition duration-300 px-3 h-10 text-sm"
                >
                    เติมยา
                </button>
            ),
            sortable: false,
            width: "100px",
            wrap: true,
        },
    ];

    return (
        <div>
            <div className="card w-full h-screen p-7 bg-white shadow-xl text-blue-800 rounded-none">
                <div className="flex justify-between items-center">
                    <h2 className="text-4xl font-bold">Stock</h2>
                    <input
                        type="text"
                        placeholder="ค้นหาชื่อยา..."
                        className="input w-full max-w-xs border-2 border-gray-300 h-12 bg-white"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
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
                            table: { style: { width: "100%", tableLayout: "fixed" } },
                            headRow: { style: { backgroundColor: "#f1f5f9" } },
                            cells: { style: { padding: "10px", borderBottom: "1px solid #e5e7eb" } },
                        }}
                    />
                </div>

                {showForm && (
                    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center z-50">
                        <div className="bg-white p-6 rounded-lg shadow-lg w-full md:w-1/2">
                            <form onSubmit={handleSubmitEdit}>
                                <label className="text-2xl font-bold text-black text-center p-4 block">
                                    ชื่อยา: {inventory?.Drug.DrugName}
                                </label>

                                {isRefillConfirmed && (
                                    <p className="text-green-600 text-center mb-4 font-semibold">
                                        กรุณากด Confirm เพื่อยืนยันการเติมยา
                                    </p>
                                )}

                                <div className="flex flex-col items-center space-y-2 mb-4">
                                    <div className="flex items-center space-x-2 mb-4">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const current = parseInt(inputValue || "0", 10);
                                                const prev = current - 1;
                                                if (prev >= 0) {
                                                    setInputValue(prev.toString());
                                                    setIsNewInput(false);
                                                }
                                            }}
                                            className="w-10 h-10 bg-red-500 hover:bg-red-600 text-white text-xl rounded-full flex items-center justify-center shadow-md"
                                        >
                                            -
                                        </button>

                                        <input
                                            type="text"
                                            value={inputValue}
                                            readOnly
                                            className="w-24 p-2 border border-gray-300 rounded text-center bg-white text-black text-xl"
                                        />

                                        <button
                                            type="button"
                                            onClick={() => {
                                                const current = parseInt(inputValue || "0", 10);
                                                const next = current + 1;
                                                if (inventory && next <= inventory.Max) {
                                                    setInputValue(next.toString());
                                                    setIsNewInput(false);
                                                } else {
                                                    Swal.fire({
                                                        icon: "warning",
                                                        title: `ถึงจำนวนสูงสุดแล้ว`,
                                                        text: `ไม่สามารถเกิน ${inventory?.Max} ได้`,
                                                    });
                                                }
                                            }}
                                            className="w-10 h-10 bg-green-500 hover:bg-green-600 text-white text-xl rounded-full flex items-center justify-center shadow-md"
                                        >
                                            +
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-3 gap-2 mt-2">
                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                                            <button
                                                key={num}
                                                type="button"
                                                onClick={() => {
                                                    const newValue = isNewInput || inputValue === "0"
                                                        ? num.toString()
                                                        : inputValue + num.toString();
                                                    const newNumber = parseInt(newValue, 10);
                                                    if (inventory && newNumber <= inventory.Max) {
                                                        setInputValue(newValue);
                                                        setIsNewInput(false);
                                                    } else {
                                                        Swal.fire({
                                                            icon: "warning",
                                                            title: `ไม่สามารถเกิน ${inventory?.Max} ได้`,
                                                            confirmButtonText: "ตกลง",
                                                        });
                                                    }
                                                }}
                                                className="w-16 h-12 bg-gray-200 hover:bg-gray-300 text-xl rounded"
                                            >
                                                {num}
                                            </button>
                                        ))}

                                        <button
                                            type="button"
                                            onClick={() => {
                                                const newValue = isNewInput || inputValue === "0"
                                                    ? "0"
                                                    : inputValue + "0";
                                                const newNumber = parseInt(newValue, 10);
                                                if (inventory && newNumber <= inventory.Max) {
                                                    setInputValue(newValue);
                                                    setIsNewInput(false);
                                                } else {
                                                    Swal.fire({
                                                        icon: "warning",
                                                        title: `ไม่สามารถเกิน ${inventory?.Max} ได้`,
                                                        confirmButtonText: "ตกลง",
                                                    });
                                                }
                                            }}
                                            className="w-16 h-12 bg-gray-200 hover:bg-gray-300 text-xl rounded col-span-2"
                                        >
                                            0
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                const newValue = inputValue.slice(0, -1) || "0";
                                                setInputValue(newValue);
                                                setIsNewInput(false);
                                            }}
                                            className="w-16 h-12 bg-red-400 hover:bg-red-500 text-white text-xl rounded"
                                        >
                                            ⌫
                                        </button>
                                    </div>

                                    <div className="flex justify-center gap-2 mt-4">
                                        {!isRefillConfirmed ? (
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    handleSubmitEdit(e as unknown as FormEvent);
                                                    setIsRefillConfirmed(true);
                                                }}
                                                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
                                            >
                                                Refill
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => inventory && sendM33Command(inventory)}
                                                className="bg-lime-500 hover:bg-lime-600 text-white font-bold py-2 px-4 rounded"
                                            >
                                                Confirm
                                            </button>
                                        )}
                                        <button
                                            type="button"
                                            onClick={resetForm}
                                            className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded"
                                        >
                                            Cancel
                                        </button>
                                    </div>
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
