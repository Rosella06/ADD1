import { FormEvent, useContext, useEffect, useState } from "react";
import axios, { AxiosError } from "axios";
import { FaBoxes, FaChevronLeft, FaChevronRight, FaSearch } from "react-icons/fa";
import Swal from "sweetalert2";
import DataTable, { TableColumn } from "react-data-table-component";

import { Usercontext } from "../../constants/constants";
import { AxiosResponse, contextType } from "../../types/global.type";

import { inventorytype } from "../../types/inventory";
import "../../styles/styles.css";

// หน้านี้ไม่ได้ใช้ drugList และ machineList แต่คง fetch data ไว้เผื่ออนาคต
// import { machinetype } from "../../types/machinetype";


function Refill() {
    const { userData } = useContext(Usercontext) as contextType;
    const [inventory, setInventory] = useState<inventorytype>();
    const [inventoryList, setInventoryList] = useState<inventorytype[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [isRefillConfirmed, setIsRefillConfirmed] = useState(false);
    const [loading, setLoading] = useState(true);
    const [, setErrorMessage] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [inputValue, setInputValue] = useState("0");
    const [isNewInput, setIsNewInput] = useState(true);

    const baseurl = `${import.meta.env.VITE_APP_API}/inventory`;

    // --- Data Fetching ---
    const fetchData = async () => {
        setLoading(true);
        try {
            await fetchInventory();
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
    
    // อัปเดต state `inventory` เมื่อ `inputValue` เปลี่ยน
    useEffect(() => {
        if (inventory) {
            const qty = parseInt(inputValue || "0", 10);
            if (!isNaN(qty)) {
                setInventory({ ...inventory, quantity: qty });
            }
        }
    }, [inputValue, inventory]);


    // --- Handlers ---
    const handleError = (error: unknown) => {
        const message =
            error instanceof AxiosError ? error.response?.data.message : "เกิดข้อผิดพลาดที่ไม่รู้จัก";
        setErrorMessage(message);
        Swal.fire({ icon: "error", title: "ผิดพลาด", text: message });
    };

    const handleRefillClick = (item: inventorytype) => {
        setInventory(item);
        setInputValue(item.quantity.toString());
        setIsNewInput(true);
        setIsRefillConfirmed(false);
        setShowForm(true);
    };

    // ขั้นตอนที่ 1: กดปุ่ม "จ่ายยา" (Refill)
    const handleRefillSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!inventory) return;

        try {
            const { quantity, id, floor, position } = inventory;
            const machineId = localStorage.getItem("selectedMachineId");
            if (!machineId) return Swal.fire({ icon: "error", title: "ไม่พบ Machine ID", text: "กรุณาเลือกเครื่องจักรก่อน" });

            // 1. Update Stock ใน DB
            await axios.put(`${baseurl}/stock/${id}`, { quantity }, {
                headers: { authorization: `Bearer ${userData.token}` },
            });

            // 2. ส่งคำสั่ง M32 ไปที่ PLC
            await axios.post(`${import.meta.env.VITE_APP_API}/plc/sendM`, {
                command: "M32", floor: floor, position: Number(position), qty: quantity, machineId,
            }, {
                headers: { authorization: `Bearer ${userData.token}` },
            });

            console.log("🔵 (Step 1) Sent M32 Command:", { floor: floor, position: position, qty: quantity });
            setIsRefillConfirmed(true); // เปลี่ยน State เพื่อไปยังขั้นตอนที่ 2
            fetchInventory(); // โหลดข้อมูลใหม่เพื่ออัปเดตตารางด้านหลัง

        } catch (error) {
            handleError(error);
        }
    };

    // ขั้นตอนที่ 2: กดปุ่ม "ยืนยันการนำยาออก" (Confirm)
    const handleConfirmSubmit = async () => {
        if (!inventory) return;
        
        try {
            const machineId = localStorage.getItem("selectedMachineId");
            if (!machineId) return Swal.fire({ icon: "error", title: "ไม่พบ Machine ID" });

            // ส่งคำสั่ง M33 ไปที่ PLC
            await axios.post(`${import.meta.env.VITE_APP_API}/plc/sendM`, {
                command: "m33", machineId, inventoryId: inventory.id,
            }, {
                headers: { authorization: `Bearer ${userData.token}` },
            });
            
            console.log("🟢 (Step 2) Sent M33 Command:", { inventoryId: inventory.id });
            Swal.fire({ icon: "success", title: "สำเร็จ", text: "กระบวนการเติมยาเสร็จสิ้น", showConfirmButton: false, timer: 2000 });
            resetForm();

        } catch (error) {
            handleError(error);
        }
    };

    const resetForm = () => {
        setShowForm(false);
        setTimeout(() => {
            setInventory(undefined);
            setIsRefillConfirmed(false);
            setInputValue("0");
        }, 300); // หน่วงเวลาเล็กน้อยเพื่อให้ animation ปิด modal ทำงาน
    };

    // --- Numpad Logic ---
    const handleNumpadInput = (numStr: string) => {
        if (isRefillConfirmed) return; // ถ้ายืนยันแล้ว ไม่ให้แก้ไข

        const currentVal = isNewInput || inputValue === "0" ? "" : inputValue;
        const newValue = currentVal + numStr;
        
        if (inventory && parseInt(newValue, 10) > inventory.max) {
            Swal.fire({ icon: "warning", title: "จำนวนเกิน", text: `ไม่สามารถเติมยาเกินจำนวนสูงสุดที่ ${inventory.max} ชิ้น` });
        } else {
            setInputValue(newValue);
            setIsNewInput(false);
        }
    };

    const handleNumpadAction = (action: 'inc' | 'dec' | 'del') => {
        if (isRefillConfirmed) return;
        
        const currentNum = parseInt(inputValue || "0", 10);
        if (action === 'inc' && inventory && currentNum < inventory.max) setInputValue((currentNum + 1).toString());
        if (action === 'dec' && currentNum > 0) setInputValue((currentNum - 1).toString());
        if (action === 'del') setInputValue(inputValue.slice(0, -1) || "0");
        setIsNewInput(false);
    }
    
    // --- Table & Filtering ---
    const filteredInventoryList = inventoryList.filter(item =>
        item.drug.drugName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.drugId.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const columnsStock: TableColumn<inventorytype>[] = [
        { name: "ชั้น", selector: row => row.floor, sortable: true, width: "80px" },
        { name: "ช่อง", selector: row => row.position, sortable: true, width: "80px" },
        { name: "ชื่อยา", selector: row => row.drug.drugName, sortable: true, grow: 2 },
        { name: "คงเหลือ", selector: row => row.quantity, sortable: true, center: true },
        { name: "Min/Max", selector: row => `${row.min}/${row.max}`, sortable: true, center: true },
        {
            name: "สถานะ", center: true,
            cell: row => (
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                    row.quantity <= row.min ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                }`}>
                    {row.quantity <= row.min ? 'ต้องเติม' : 'ปกติ'}
                </span>
            )
        },
        {
            name: "จัดการ", center: true,
            cell: item => (
                <button
                    onClick={() => handleRefillClick(item)}
                    className="btn btn-sm btn-info text-white"
                >
                    <FaBoxes /> เติมยา
                </button>
            ),
        },
    ];

    return (
        <div className="flex flex-col items-center pt-10 bg-white min-h-screen">
             {loading && (
                <div className="fixed inset-0 bg-white bg-opacity-75 flex justify-center items-center z-[100]">
                    <span className="loading loading-spinner loading-lg text-blue-600"></span>
                </div>
            )}
            <div className="w-full max-w-7xl mx-auto ">
                <div className="p-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
                        <h2 className="text-3xl font-bold text-gray-800">เติมยา</h2>
                        <div className="relative w-full md:w-80">
                            <input
                                type="text"
                                placeholder="ค้นหาชื่อยา หรือรหัสยา..."
                                className="input input-bordered w-full bg-white pl-10"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                        </div>
                    </div>
                    <DataTable
                        columns={columnsStock}
                        data={filteredInventoryList}
                        pagination paginationPerPage={10}
                        paginationRowsPerPageOptions={[10, 15, 20]}
                        responsive highlightOnHover
                        conditionalRowStyles={[{
                            when: row => row.quantity <= row.min,
                            style: { backgroundColor: '#FFF1F2', '&:hover': { backgroundColor: '#FFE4E6 !important' } },
                        }]}
                    />
                </div>
            </div>

            {/* Modal Form */}
            {showForm && inventory && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
                    <form onSubmit={handleRefillSubmit} className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md transform transition-all text-center">
                        <fieldset disabled={isRefillConfirmed}>
                            <h3 className="text-sm font-semibold text-gray-500">เติมยาสำหรับ</h3>
                            <h2 className="text-2xl font-bold text-gray-800 mt-1">{inventory.drug.drugName}</h2>
                            <p className="text-gray-600">ชั้น {inventory.floor}, ช่อง {inventory.position} (สูงสุด: {inventory.max} ชิ้น)</p>

                            <div className="my-6">
                                <div className="relative inline-flex items-center">
                                    <button type="button" onClick={() => handleNumpadAction('dec')} className="btn btn-ghost btn-circle"><FaChevronLeft/></button>
                                    <input
                                        type="text"
                                        value={inputValue}
                                        readOnly
                                        className="w-32 h-16 text-5xl font-bold text-center bg-transparent text-blue-600 focus:outline-none"
                                    />
                                    <button type="button" onClick={() => handleNumpadAction('inc')} className="btn btn-ghost btn-circle"><FaChevronRight/></button>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-2 w-64 mx-auto">
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num =>
                                    <button key={num} type="button" onClick={() => handleNumpadInput(num.toString())} className="btn btn-lg btn-ghost text-2xl">{num}</button>
                                )}
                                <button type="button" onClick={() => handleNumpadAction('del')} className="btn btn-lg btn-ghost text-error">⌫</button>
                                <button type="button" onClick={() => handleNumpadInput('0')} className="btn btn-lg btn-ghost text-2xl">0</button>
                                <button type="button" onClick={() => setInputValue(inventory.max.toString())} className="btn btn-lg btn-ghost text-info">MAX</button>
                            </div>
                        </fieldset>

                        <div className="mt-8 pt-4 border-t">
                            {isRefillConfirmed ? (
                                <>
                                    <p className="text-green-600 font-semibold mb-3">✅ จำนวนยาถูกต้องหรือไม่<br/>กรุณากดยืนยัน เมื่อเติมยาเสร็จ</p>
                                    <button type="button" onClick={handleConfirmSubmit} className="btn btn-success w-full text-white">
                                        ยืนยันการเติมยา(Confirm)
                                    </button>
                                </>
                            ) : (
                                <button type="submit" className="btn btn-primary w-full">
                                    จ่ายยา (Refill)
                                </button>
                            )}
                            <button type="button" onClick={resetForm} className="btn btn-ghost mt-2 w-full">
                                ยกเลิก
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}

export default Refill;