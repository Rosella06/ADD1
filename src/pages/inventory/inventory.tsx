import { FormEvent, useContext, useEffect, useState } from "react";
import axios, { AxiosError } from "axios";
import { Usercontext } from "../../constants/constants";
import { AxiosResponse, contextType } from "../../types/global.type";
import DataTable, { TableColumn } from "react-data-table-component";
import Swal from "sweetalert2";
import { FaEdit, FaPlus, FaTrash } from "react-icons/fa";
import { drugstype } from "../../types/drugs";
import { machinetype } from "../../types/machinetype";
import { inventorytype } from "../../types/inventory";
import "../../styles/styles.css";


const initialInventory: inventorytype = {
  id: "",
  InventoryPosition: 0,
  Min: 0,
  Max: 0,
  InventoryQty: 0,
  InventoryStatus: true,
  DrugId: "",
  MachineId: "",
  Expiydate: "",
  InventoryFloor: 0,
  Drug: {
    id: "",
    DrugName: "",
    DrugStatus: true,
    DrugImage: "",
    CreatedAt: "",
    UpdatedAt: ""
  }
};
function Inventory() {
  const { userData } = useContext(Usercontext) as contextType;
  const [inventory, setInventory] = useState<inventorytype>(initialInventory);
  const [inventoryList, setInventoryList] = useState<inventorytype[]>([]);
  const [drugList, setDrugList] = useState<drugstype[]>([]);
  const [machine, setMachineList] = useState<machinetype[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const baseurl = `${import.meta.env.VITE_APP_API}/inventory`;
  // const [isManual, setIsManual] = useState(false);

  // ดึงข้อมูลทั้งหมด (Inventory, Drug list, Machine list)
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
      const response = await axios.get<AxiosResponse<drugstype[]>>(
        `${import.meta.env.VITE_APP_API}/drugs`,
        {
          headers: { Authorization: `Bearer ${userData.token}` },
        }
      );
      setDrugList(response.data.data);
    } catch (error) {
      handleError(error);
    }
  };

  const fetchMachineList = async () => {
    try {
      const response = await axios.get<AxiosResponse<machinetype[]>>(
        `${import.meta.env.VITE_APP_API}/machine`,
        {
          headers: { Authorization: `Bearer ${userData.token}` },
        }
      );
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

  const resetForm = () => {
    setInventory(initialInventory);
    setIsEditMode(false);
    setShowForm(false);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    // ตรวจสอบข้อมูลเบื้องต้น
    if (
      !inventory.InventoryPosition ||
      !inventory.InventoryQty ||
      !inventory.InventoryFloor ||
      !inventory.DrugId ||
      // !inventory.Expiydate ||
      inventory.Min < 0 ||
      inventory.Max <= inventory.Min
    ) {
      return Swal.fire({
        icon: "error",
        title: "กรุณากรอกข้อมูลให้ครบและถูกต้อง",
        showConfirmButton: false,
        timer: 1500,
      });
    }

    try {
      const inventoryBody = {
        InventoryPosition: inventory.InventoryPosition,
        InventoryQty: inventory.InventoryQty,
        DrugId: inventory.DrugId,
        // Expiydate: inventory.Expiydate,
        Min: inventory.Min,
        Max: inventory.Max,
        InventoryFloor: inventory.InventoryFloor,
      };
      const response = await axios.post<AxiosResponse<inventorytype>>(
        baseurl,
        inventoryBody,
        {
          headers: { authorization: `Bearer ${userData.token}` },
        }
      );
      Swal.fire({
        icon: "success",
        title: response.data.message,
        showConfirmButton: false,
        timer: 1500,
      });
      fetchInventory();
      resetForm();
    } catch (error) {
      handleError(error);
    }
  };

  const handleSubmitEdit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (
      !inventory.id ||
      !inventory.InventoryPosition ||
      !inventory.InventoryQty ||
      !inventory.InventoryFloor ||
      // !inventory.Expiydate ||
      !inventory.DrugId ||
      inventory.Min < 0 ||
      inventory.Max <= inventory.Min
    ) {
      return Swal.fire({
        icon: "error",
        title: "กรุณากรอกข้อมูลให้ครบและถูกต้อง",
        showConfirmButton: false,
        timer: 1500,
      });
    }

    try {
      const inventoryBody = {
        InventoryPosition: inventory.InventoryPosition,
        InventoryQty: inventory.InventoryQty,
        DrugId: inventory.DrugId,
        // Expiydate: inventory.Expiydate,
        Min: inventory.Min,
        Max: inventory.Max,
        InventoryFloor: inventory.InventoryFloor,
      };
      const response = await axios.put<AxiosResponse<inventorytype>>(
        `${baseurl}/${inventory.id}`,
        inventoryBody,
        {
          headers: { authorization: `Bearer ${userData.token}` },
        }
      );
      Swal.fire({
        icon: "success",
        title: response.data.message,
        showConfirmButton: false,
        timer: 1500,
      });
      fetchInventory();
      resetForm();
    } catch (error) {
      handleError(error);
    }
  };

  const deleteInventory = async (id: string) => {
    Swal.fire({
      title: "คุณต้องการลบหรือไม่?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "ลบ",
      cancelButtonText: "ยกเลิก",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await axios.delete<AxiosResponse<inventorytype>>(
            `${baseurl}/${id}`,
            {
              headers: { authorization: `Bearer ${userData.token}` },
            }
          );
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
      name: "Floor",
      selector: (row) => row.InventoryFloor,
      sortable: true,
    },
    {
      name: "Position",
      selector: (row) => row.InventoryPosition,
      sortable: true,
    },
    // {
    //   name: "DrugImage",
    //   cell: (item) => (
    //     <img
    //       src={
    //         item.Drug.DrugImage && item.Drug.DrugImage.trim() !== ""
    //           ? `${import.meta.env.VITE_APP_IMG}${item.Drug.DrugImage}`
    //           : defaultImage
    //       }
    //       alt="drugimg"
    //       className="rounded-md text-center object-contain h-20 w-60"
    //     />
    //   ),
    //   sortable: false,
    // },
    {
      name: "DrugId",
      selector: (row) => row.DrugId,
      sortable: true,
    },
    {
      name: "DrugName",
      selector: (row) => row.Drug.DrugName,
      sortable: true,
    },
    {
      name: "Qty",
      selector: (row) => row.InventoryQty,
      sortable: true,
    },
    {
      name: "Min",
      selector: (row) => row.Min,
      sortable: true,
    },
    {
      name: "Max",
      selector: (row) => row.Max,
      sortable: true,
    },
    // {
    //   name: "วันหมดอายุ",
    //   selector: (row) => row.Expiydate,
    //   sortable: true,
    // },
    {
      name: "Actions",
      cell: (item) => (
        <div className="flex space-x-4 text-2xl justify-center">
          <button onClick={() => editInventory(item)} className="text-yellow-400">
            <FaEdit />
          </button>
          <button onClick={() => deleteInventory(item.id)} className="text-red-600">
            <FaTrash />
          </button>
        </div>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },
  ];

  const filteredInventoryList = inventoryList.filter(
    (item) =>
      item.Drug.DrugName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.InventoryPosition.toString().includes(searchTerm)
  );

  return (
    <div className="flex flex-col items-center py-4 bg-gray-100 w-full">
      {loading && (
        <div className="loading-wrapper">
          <span className="loading loading-ball loading-xs"></span>
          <span className="loading loading-ball loading-sm"></span>
          <span className="loading loading-ball loading-md"></span>
          <span className="loading loading-ball loading-lg"></span>
        </div>
      )}
      <div className="card w-full h-screen p-4 bg-white shadow-xl text-blue-800 rounded-none">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-4xl font-bold">Inventory</h2>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              placeholder="ค้นหาชื่อยา..."
              className="input w-full max-w-xs border-2 border-gray-300 h-12 bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
              className="btn bg-green-500 text-white hover:bg-green-400 transition duration-300 h-12 flex items-center"
            >
              <FaPlus />
            </button>
          </div>
        </div>
        <div className="divider my-2"></div>
        <div className="h-full w-full overflow-x-auto flex-grow bg-white text-black">
          <DataTable
            columns={columnsInventory}
            data={filteredInventoryList}
            pagination
            paginationPerPage={15}
            paginationRowsPerPageOptions={[6, 10, 15, 20]}
            responsive
            customStyles={{
              table: {
                style: {
                  width: "100%",
                  tableLayout: "fixed",
                },
              },
              headRow: {
                style: {
                  backgroundColor: "#f1f5f9",
                },
              },
              cells: {
                style: {
                  padding: "8px",
                  textAlign: "center",
                  fontSize: "14px",
                },
              },
            }}
          />
        </div>
        {showForm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded shadow-lg w-full max-w-lg">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">
                  {isEditMode ? "Edit Inventory" : "Add Inventory"}
                </h2>
                <button onClick={() => setShowForm(false)} className="text-red-500 font-bold">
                  ✕
                </button>
              </div>
              {errorMessage && <p className="text-red-500 mb-2">{errorMessage}</p>}
              <form onSubmit={isEditMode ? handleSubmitEdit : handleSubmit}>
                <select
                  id="DrugId"
                  value={inventory.DrugId}
                  onChange={(e) => setInventory({ ...inventory, DrugId: e.target.value })}
                  required
                  className="p-2 border border-gray-300 rounded bg-white text-zinc-700"
                >
                  <option value="">-- เลือกรหัสยา --</option>
                  {drugList.map((drug) => (
                    <option key={drug.Drugcode} value={drug.Drugcode}>
                      {drug.Drugcode}
                    </option>
                  ))}
                </select>
                <div className="flex flex-col mb-4">
                  <label htmlFor="InventoryFloor" className="block text-sm font-medium text-gray-900">
                    InventoryFloor
                  </label>
                  <input
                    type="number"
                    id="InventoryFloor"
                    value={inventory.InventoryFloor}
                    onChange={(e) =>
                      setInventory({ ...inventory, InventoryFloor: Number(e.target.value) })
                    }
                    required
                    className="p-2 border border-gray-300 rounded bg-white text-zinc-700"
                  />
                </div>
                <div className="flex flex-col mb-4">
                  <label htmlFor="InventoryPosition" className="block text-sm font-medium text-gray-900">
                    InventoryPosition
                  </label>
                  <input
                    type="number"
                    id="InventoryPosition"
                    value={inventory.InventoryPosition}
                    onChange={(e) =>
                      setInventory({ ...inventory, InventoryPosition: Number(e.target.value) })
                    }
                    required
                    className="p-2 border border-gray-300 rounded bg-white text-zinc-700"
                  />
                </div>

                <div className="flex flex-col mb-4">
                  <label htmlFor="InventoryQty" className="block text-sm font-medium text-gray-900">
                    InventoryQty
                  </label>
                  <input
                    type="number"
                    id="InventoryQty"
                    value={inventory.InventoryQty}
                    onChange={(e) =>
                      setInventory({ ...inventory, InventoryQty: Number(e.target.value) })
                    }
                    required
                    className="p-2 border border-gray-300 rounded bg-white text-zinc-700"
                  />
                </div>
                <div className="flex space-x-4 mb-4">
                  <div className="flex-1">
                    <label htmlFor="Min" className="block text-sm font-medium text-gray-900">
                      Min
                    </label>
                    <input
                      type="number"
                      id="Min"
                      value={inventory.Min}
                      onChange={(e) =>
                        setInventory({ ...inventory, Min: Number(e.target.value) })
                      }
                      required
                      min={0}
                      className="p-2 border border-gray-300 rounded bg-white text-zinc-700 w-full"
                    />
                  </div>
                  <div className="flex-1">
                    <label htmlFor="Max" className="block text-sm font-medium text-gray-900">
                      Max
                    </label>
                    <input
                      type="number"
                      id="Max"
                      value={inventory.Max}
                      onChange={(e) =>
                        setInventory({ ...inventory, Max: Number(e.target.value) })
                      }
                      required
                      min={inventory.Min}
                      className="p-2 border border-gray-300 rounded bg-white text-zinc-700 w-full"
                    />
                  </div>
                  {/* <div className="flex flex-col mb-4">
                    <label htmlFor="ExpiryDate" className="block text-sm font-medium text-gray-900">
                      วันหมดอายุ
                    </label>
                    <input
                      type={isManual ? "text" : "date"} // toggle ได้ระหว่าง text กับ date
                      id="ExpiryDate"
                      placeholder={isManual ? "กรอกวันที่ เช่น 2025-06-30" : ""}
                      value={inventory.Expiydate}
                      onChange={(e) =>
                        setInventory({ ...inventory, Expiydate: e.target.value })
                      }
                      required
                      className="p-2 border border-gray-300 rounded bg-white text-zinc-700"
                    />
                    <button
                      type="button"
                      onClick={() => setIsManual(!isManual)}
                      className="mt-1 text-sm text-blue-500 hover:underline self-end"
                    >
                      {isManual ? "เปลี่ยนเป็นปฏิทิน" : "กรอกด้วยตัวเอง"}
                    </button>
                  </div>
 */}
                </div>
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn bg-green-500 text-white hover:bg-green-600 transition duration-300"
                  >
                    {isEditMode ? "Update" : "Add"}
                  </button>
                  {isEditMode && (
                    <button
                      onClick={() => deleteInventory(inventory.id)}
                      type="button"
                      className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded"
                    >
                      ลบ
                    </button>
                  )}
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
