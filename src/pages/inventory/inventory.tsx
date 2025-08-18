import { FormEvent, useContext, useEffect, useState } from "react";
import axios, { AxiosError } from "axios";
import { Usercontext } from "../../constants/constants";
import { AxiosResponse, contextType } from "../../types/global.type";
import DataTable, { TableColumn } from "react-data-table-component";
import Swal from "sweetalert2";
import { FaEdit, FaPlus, FaTrash } from "react-icons/fa";
import { drugstype } from "../../types/drugs";
import { inventorytype } from "../../types/inventory";
import "../../styles/styles.css";

const initialInventory: inventorytype = {
  id: "",
  floor: 1,
  position: 1,
  quantity: 1,
  min: 1,
  max: 99,
  status: true,
  expiryDate: "",
  drugId: "",
  machineId: "",
  drug: {
    id: "",
    drugName: "",
    drugStatus: true,
    drugImage: "",
    createdAt: "",
    updatedAt: "",
  },
};

function Inventory() {
  const { userData } = useContext(Usercontext) as contextType;
  const [inventory, setInventory] = useState<inventorytype>(initialInventory);
  const [inventoryList, setInventoryList] = useState<inventorytype[]>([]);
  const [drugList, setDrugList] = useState<drugstype[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const baseurl = `${import.meta.env.VITE_APP_API}/inventories`;

  // ดึงข้อมูลทั้งหมด
  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchInventory(), fetchDrugList()]);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInventory = async () => {
    try {
      const response = await axios.get<AxiosResponse<inventorytype[]>>(
        baseurl,
        { headers: { authorization: `Bearer ${userData.token}` } }
      );
      setInventoryList(response.data.data);
    } catch (error) {
      handleError(error);
    }
  };

  const fetchDrugList = async () => {
    try {
      const response = await axios.get<AxiosResponse<drugstype[]>>(
        `${import.meta.env.VITE_APP_API}/drugs`,
        { headers: { Authorization: `Bearer ${userData.token}` } }
      );
      setDrugList(response.data.data);
    } catch (error) {
      handleError(error);
    }
  };

  const handleError = (error: unknown) => {
    console.error("🔥 Error:", error);
    const message =
      error instanceof AxiosError
        ? error.response?.data.message
        : "เกิดข้อผิดพลาดที่ไม่รู้จัก";
    setErrorMessage(message);
    Swal.fire({ icon: "error", title: "ผิดพลาด", text: message });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const resetForm = () => {
    setInventory(initialInventory);
    setIsEditMode(false);
    setShowForm(false);
    setErrorMessage("");
  };

  // ฟังก์ชันสำหรับ validate ข้อมูลฟอร์ม
  const validateForm = () => {
    if (
      inventory.floor < 1 || inventory.floor > 7 ||
      inventory.position < 1 || inventory.position > 12
    ) {
      Swal.fire({ icon: "error", title: "ข้อมูลไม่ถูกต้อง", text: "กรุณากรอกชั้น (1-7) และช่อง (1-12)" });
      return false;
    }
    if (!inventory.drugId) {
      Swal.fire({ icon: "error", title: "ข้อมูลไม่ครบถ้วน", text: "กรุณาเลือกยา" });
      return false;
    }
    if (inventory.min < 0 || inventory.max <= inventory.min) {
      Swal.fire({ icon: "error", title: "ข้อมูลไม่ถูกต้อง", text: "ค่า Max ต้องมากกว่า Min และ Min ต้องไม่ติดลบ" });
      return false;
    }


    const isDuplicate = inventoryList.some(item =>
      item.floor === inventory.floor &&
      item.position === inventory.position &&
      item.id !== inventory.id 
    );

    if (isDuplicate) {
      Swal.fire({ icon: "error", title: "ตำแหน่งซ้ำ", text: `ชั้น ${inventory.floor} ช่อง ${inventory.position} ถูกใช้ไปแล้ว` });
      return false;
    }

    return true;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const inventoryBody = {
        position: inventory.position,
        quantity: inventory.quantity,
        drugId: inventory.drugId,
        min: inventory.min,
        max: inventory.max,
        floor: inventory.floor,
        
      };


      const response = await axios.post(baseurl, inventoryBody, {
        headers: { authorization: `Bearer ${userData.token}` },
      });
      Swal.fire({ icon: "success", title: response.data.message, showConfirmButton: false, timer: 1500 });
      fetchInventory();
      resetForm();
    } catch (error) {
      handleError(error);
    }
  };

  const handleSubmitEdit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const inventoryBody = {
        InventoryPosition: inventory.position,
        InventoryQty: inventory.quantity,
        DrugId: inventory.drugId,
        Min: inventory.min,
        Max: inventory.max,
        InventoryFloor: inventory.floor,
 
      };

      const response = await axios.put<AxiosResponse<inventorytype>>(
        `${baseurl}/${inventory.id}`,
        inventoryBody,
        { headers: { authorization: `Bearer ${userData.token}` } }
      );
      Swal.fire({ icon: "success", title: response.data.message, showConfirmButton: false, timer: 1500 });
      fetchInventory();
      resetForm();
    } catch (error) {
      handleError(error);
    }
  };

  const deleteInventory = (id: string) => {
    Swal.fire({
      title: "คุณแน่ใจหรือไม่?",
      text: "การกระทำนี้ไม่สามารถย้อนกลับได้",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "ใช่, ลบเลย",
      cancelButtonText: "ยกเลิก",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await axios.delete<AxiosResponse<inventorytype>>(
            `${baseurl}/${id}`,
            { headers: { authorization: `Bearer ${userData.token}` } }
          );
          Swal.fire({ icon: "success", title: "ลบสำเร็จ!", text: response.data.message, showConfirmButton: false, timer: 1500 });
          fetchInventory();
          resetForm(); 
        } catch (error) {
          handleError(error);
        }
      }
    });
  };

  const handleEditClick = (item: inventorytype) => {
    setInventory(item);
    setIsEditMode(true);
    setShowForm(true);
  };

  const handleAddClick = () => {
    resetForm();
    setIsEditMode(false);
    setShowForm(true);
  }

  const columnsInventory: TableColumn<inventorytype>[] = [
    { name: "ชั้น", selector: (row) => row.floor, sortable: true, width: "80px", },
    { name: "ช่อง", selector: (row) => row.position, sortable: true, width: "80px", },
    { name: "รหัสยา", selector: (row) => row.drugId, sortable: true, },
    { name: "ชื่อยา", selector: (row) => row.drug.drugName, sortable: true, grow: 2, },
    { name: "จำนวน", selector: (row) => row.quantity, sortable: true, center: true, },
    { name: "Min/Max", selector: (row) => `${row.min}/${row.max}`, sortable: true, center: true, },
    {
      name: "สถานะ",
      sortable: true,
      center: true,
      cell: (row) => {
        let color = "text-green-600";
        let text = "ปกติ";
        if (row.quantity <= 0) {
          color = "text-red-600";
          text = "หมด";
        } else if (row.quantity <= row.min) {
          color = "text-orange-500";
          text = "ใกล้หมด";
        }
        return (
          <div className={`flex items-center gap-2 font-semibold ${color}`}>
            <span>●</span>
            <span>{text}</span>
          </div>
        );
      },
    },
    {
      name: "จัดการ",
      center: true,
      cell: (item) => (
        <div className="flex space-x-4 text-lg justify-center">
          <button onClick={() => handleEditClick(item)} className="text-blue-500 hover:text-blue-700 transition-colors">
            <FaEdit />
          </button>
          <button onClick={() => deleteInventory(item.id)} className="text-red-500 hover:text-red-700 transition-colors">
            <FaTrash />
          </button>
        </div>
      ),
    },
  ];

  // กรองข้อมูลตามการค้นหา
  const filteredInventoryList = inventoryList.filter(
    (item) =>
      item.drug.drugName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.drugId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.floor.toString().includes(searchTerm) ||
      item.position.toString().includes(searchTerm)
  );

  return (
    <div className="flex flex-col items-center pt-10  bg-white  min-h-screen">
      {loading && (
        <div className="fixed inset-0 bg-white bg-opacity-75 flex justify-center items-center z-[100]">
          <span className="loading loading-spinner loading-lg text-blue-600"></span>
        </div>
      )}
      <div className="w-full max-w-7xl mx-auto bg-white  ">
        <div className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
            <h2 className="text-3xl font-bold text-gray-800">จัดการคลังยา (Inventory)</h2>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <input
                type="text"
                placeholder="ค้นหา (ชื่อยา, รหัส, ชั้น, ช่อง)..."
                className="input input-bordered w-full md:w-80 bg-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button onClick={handleAddClick} className="btn btn-primary">
                <FaPlus />
                เพิ่ม
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <DataTable
              columns={columnsInventory}
              data={filteredInventoryList}
              pagination
              paginationPerPage={10}
              paginationRowsPerPageOptions={[10, 15, 20]}
              responsive
              highlightOnHover
              defaultSortFieldId={1} // Sort by Floor by default
            />
          </div>
        </div>

      </div>

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-2xl transform transition-all">
            <div className="flex justify-between items-center mb-6 pb-3 border-b">
              <h2 className="text-2xl font-bold text-gray-800">
                {isEditMode ? "แก้ไขข้อมูลในคลัง" : "เพิ่มยาเข้าคลัง"}
              </h2>
              <button onClick={resetForm} className="text-gray-400 hover:text-gray-600 text-2xl">
                &times;
              </button>
            </div>

            {errorMessage && <p className="text-red-500 mb-4">{errorMessage}</p>}

            <form onSubmit={isEditMode ? handleSubmitEdit : handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                {/* Drug Selection */}
                <div className="md:col-span-2">
                  <label htmlFor="DrugId" className="block text-sm font-medium text-gray-700 mb-1">ยา</label>
                  <select
                    id="DrugId"
                    value={inventory.drugId}
                    onChange={(e) => setInventory({ ...inventory, drugId: e.target.value })}
                    required
                    disabled={isEditMode} // ไม่ให้เปลี่ยนยาตอน Edit
                    className="select select-bordered w-full bg-white disabled:bg-gray-200 disabled:text-gray-500"
                  >
                    <option value="">-- เลือกรหัสยา --</option>
                    {drugList.map((drug) => {
                      const isUsedByOther = inventoryList.some(inv => inv.drugId === drug.drugName && inv.id !== inventory.id);
                      return (
                        <option key={drug.drugName} value={drug.drugName} disabled={!isEditMode && isUsedByOther}>
                          {drug.drugName} - {drug.drugName} {!isEditMode && isUsedByOther ? " (มีในคลังแล้ว)" : ""}
                        </option>
                      );
                    })}
                  </select>
                  {isEditMode && <p className="text-xs text-gray-500 mt-1">ไม่สามารถเปลี่ยนยาได้ในโหมดแก้ไข</p>}
                </div>

                {/* InventoryFloor & InventoryPosition */}
                <div>
                  <label htmlFor="InventoryFloor" className="block text-sm font-medium text-gray-700 mb-1">ชั้น</label>
                  <input type="number" id="InventoryFloor" value={inventory.floor}
                    onChange={(e) => setInventory({ ...inventory, floor: Number(e.target.value) })}
                    min="1" max="7" required className="input input-bordered w-full bg-white"
                  />
                </div>
                <div>
                  <label htmlFor="InventoryPosition" className="block text-sm font-medium text-gray-700 mb-1">ช่อง</label>
                  <input type="number" id="InventoryPosition" value={inventory.position}
                    onChange={(e) => setInventory({ ...inventory, position: Number(e.target.value) })}
                    min="1" max="12" required className="input input-bordered w-full bg-white"
                  />
                </div>

                {/* InventoryQty */}
                <div className="md:col-span-2">
                  <label htmlFor="InventoryQty" className="block text-sm font-medium text-gray-700 mb-1">จำนวนคงคลัง</label>
                  <input type="number" id="InventoryQty" value={inventory.quantity}
                    onChange={(e) => setInventory({ ...inventory, quantity: Number(e.target.value) })}
                    min="0" required className="input input-bordered w-full bg-white"
                  />
                </div>


                {/* Min & Max */}
                <div>
                  <label htmlFor="Min" className="block text-sm font-medium text-gray-700 mb-1">จำนวนขั้นต่ำ (Min)</label>
                  <input type="number" id="Min" value={inventory.min}
                    onChange={(e) => setInventory({ ...inventory, min: Number(e.target.value) })}
                    min="0" required className="input input-bordered w-full bg-white"
                  />
                </div>
                <div>
                  <label htmlFor="Max" className="block text-sm font-medium text-gray-700 mb-1">จำนวนสูงสุด (Max)</label>
                  <input type="number" id="Max" value={inventory.max}
                    onChange={(e) => setInventory({ ...inventory, max: Number(e.target.value) })}
                    min={inventory.min + 1} required className="input input-bordered w-full bg-white"
                  />
                </div>

              </div>
              <div className="flex items-center justify-end mt-8 pt-4 border-t gap-3">
                {isEditMode && (
                  <button type="button" onClick={() => deleteInventory(inventory.id)} className="btn btn-error btn-outline mr-auto">
                    <FaTrash /> ลบ
                  </button>
                )}
                <button type="button" onClick={resetForm} className="btn btn-ghost">
                  ยกเลิก
                </button>
                <button type="submit" className="btn btn-success text-white">
                  {isEditMode ? "บันทึกการเปลี่ยนแปลง" : "เพิ่มเข้าคลัง"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Inventory;