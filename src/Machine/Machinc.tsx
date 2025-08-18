import React, { useEffect, useState, useContext } from 'react';
import axios, { AxiosError } from 'axios';
import { FaTrash, FaPlus, FaEdit, FaSearch } from 'react-icons/fa';
import DataTable, { TableColumn } from 'react-data-table-component';
import Swal from 'sweetalert2';

import { Usercontext } from '../constants/constants';
import { machinetype } from '../types/machinetype';
import { contextType } from '../types/global.type';
import '../styles/styles.css';

// State เริ่มต้นสำหรับฟอร์ม
const initialMachineState = { machineName: '', status: '', ipAddress: '' };

function Machine() {
  const { userData } = useContext(Usercontext) as contextType;
  const [machine, setMachine] = useState(initialMachineState);
  const [machines, setMachines] = useState<machinetype[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedMachineId, setSelectedMachineId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const baseurl = `${import.meta.env.VITE_APP_API}/machines`;

  // --- Data Fetching ---
  const fetchMachine = async () => {
    setLoading(true);
    try {
      const response = await axios.get(baseurl, {
        headers: { Authorization: `Bearer ${userData.token}` },
      });
      setMachines(response.data.data);
      setError(null);
    } catch (err) {
      const message = err instanceof AxiosError ? err.response?.data.message : 'เกิดข้อผิดพลาดไม่ทราบสาเหตุ';
      setError(message);
      Swal.fire({ icon: 'error', title: 'ผิดพลาด', text: message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMachine();
  }, []);

  // --- Handlers ---
  const handleApiError = (err: unknown, defaultMessage: string) => {
    console.error("🔥 Error:", err);
    const message = err instanceof AxiosError ? err.response?.data.message : defaultMessage;
    Swal.fire({ icon: 'error', title: 'ผิดพลาด', text: message });
  };
  
  const resetForm = () => {
      setMachine(initialMachineState);
      setIsEditMode(false);
      setSelectedMachineId(null);
      setShowForm(false);
  }

  const handleAddClick = () => {
    resetForm();
    setShowForm(true);
  };

  const handleEditClick = (machineData: machinetype) => {
    setIsEditMode(true);
    setSelectedMachineId(machineData.id);
    setMachine({
      machineName: machineData.machineName,
      status: machineData.status,
      ipAddress: machineData.ipAddress,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!machine.machineName.trim() || !machine.ipAddress.trim()) {
      Swal.fire({ icon: 'warning', title: 'ข้อมูลไม่ครบถ้วน', text: 'กรุณากรอกชื่อเครื่องและ IP Address' });
      return;
    }

    try {
      const action = isEditMode
        ? axios.put(`${baseurl}/${selectedMachineId}`, machine, { headers: { Authorization: `Bearer ${userData.token}` } })
        : axios.post(baseurl, machine, { headers: { Authorization: `Bearer ${userData.token}` } });
      
      await action;

      Swal.fire({
        icon: 'success',
        title: isEditMode ? 'แก้ไขข้อมูลสำเร็จ' : 'เพิ่มเครื่องจักรสำเร็จ',
        showConfirmButton: false,
        timer: 1500,
      });

      fetchMachine();
      resetForm();

    } catch (err) {
      handleApiError(err, `เกิดข้อผิดพลาดในการ${isEditMode ? 'แก้ไข' : 'เพิ่ม'}เครื่องจักร`);
    }
  };

  const handleDelete = (id: string) => {
    Swal.fire({
      title: "คุณแน่ใจหรือไม่?",
      text: "คุณต้องการลบเครื่องจักรนี้ใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "ใช่, ลบเลย",
      cancelButtonText: "ยกเลิก",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`${baseurl}/${id}`, {
            headers: { Authorization: `Bearer ${userData.token}` },
          });
          Swal.fire({ icon: 'success', title: 'ลบสำเร็จ!', showConfirmButton: false, timer: 1500 });
          fetchMachine();
          resetForm(); // หากกำลังแก้ไขรายการที่ถูกลบ ให้ปิดฟอร์ม
        } catch (err) {
          handleApiError(err, 'เกิดข้อผิดพลาดในการลบเครื่องจักร');
        }
      }
    });
  };

  // --- Table & Filtering ---
  const filteredMachines = machines.filter(m =>
    m.machineName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.ipAddress.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns: TableColumn<machinetype>[] = [
    { name: 'ID', selector: row => row.id, sortable: true, grow: 2, wrap: true },
    { name: 'ชื่อเครื่อง', selector: row => row.machineName, sortable: true, grow: 2 },
    { name: 'IP Address', selector: row => row.ipAddress, sortable: true, grow: 1 },
    {
      name: 'สถานะ', sortable: true, center: true,
      cell: row => (
        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
          row.status === 'online' ? 'bg-success text-success-content' : 'bg-green-400 text-black'
        }`}>
          {row.status }
        </span>
      ),
    },
    {
      name: 'จัดการ', center: true,
      cell: item => (
        <div className="flex space-x-2">
          <button onClick={() => handleEditClick(item)} className="btn btn-sm btn-warning text-white">
            <FaEdit /> แก้ไข
          </button>
          <button onClick={() => handleDelete(item.id)} className="btn btn-sm btn-error text-white">
            <FaTrash /> ลบ
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col items-center pt-10 bg-white  min-h-screen">
      <div className="w-full max-w-7xl mx-auto  ">
        <div className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
            <h2 className="text-3xl font-bold text-gray-800">จัดการเครื่องจักร</h2>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative w-full md:w-80">
                <input
                  type="text"
                  placeholder="ค้นหาชื่อเครื่อง หรือ IP..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="input input-bordered w-full bg-white pl-10"
                />
                 <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
              </div>
              <button onClick={handleAddClick} className="btn btn-primary">
                <FaPlus /> เพิ่มเครื่องจักร
              </button>
            </div>
          </div>
          <DataTable
            columns={columns}
            data={filteredMachines}
            pagination paginationPerPage={10}
            responsive highlightOnHover
            progressPending={loading}
            progressComponent={<span className="loading loading-lg loading-spinner text-primary"></span>}
            noDataComponent={
                <div className="py-10 text-center text-gray-500">
                    {error ? `เกิดข้อผิดพลาด: ${error}` : 'ไม่พบข้อมูลเครื่องจักร'}
                </div>
            }
          />
        </div>
      </div>

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-lg transform transition-all">
            <div className="flex justify-between items-center mb-6 pb-3 border-b">
              <h2 className="text-2xl font-bold text-gray-800">
                {isEditMode ? 'แก้ไขข้อมูลเครื่องจักร' : 'เพิ่มเครื่องจักรใหม่'}
              </h2>
              <button type="button" onClick={resetForm} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="MachineName" className="block text-sm font-medium text-gray-700">ชื่อเครื่อง</label>
                <input
                  type="text"
                  id="MachineName"
                  value={machine.machineName}
                  onChange={(e) => setMachine({ ...machine, machineName: e.target.value })}
                  className="input input-bordered w-full bg-white mt-1"
                  required
                />
              </div>
              <div>
                <label htmlFor="IP" className="block text-sm font-medium text-gray-700">IP Address</label>
                <input
                  type="text"
                  id="IP"
                  value={machine.ipAddress}
                  onChange={(e) => setMachine({ ...machine, ipAddress: e.target.value })}
                  className="input input-bordered w-full bg-white mt-1"
                  required
                />
              </div>
              <div>
                <label htmlFor="MachineStatus" className="block text-sm font-medium text-gray-700">สถานะ</label>
                <select
                  id="MachineStatus"
                  value={machine.status}
                  onChange={(e) => setMachine({ ...machine, status: e.target.value })}
                  className="select select-bordered w-full bg-white mt-1"
                  required
                >
                  <option value="1">online</option>
                  <option value="0">noonline</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end mt-8 pt-4 border-t gap-3">
               {isEditMode && selectedMachineId && (
                    <button type="button" onClick={() => handleDelete(selectedMachineId)} className="btn btn-error btn-outline mr-auto">
                        <FaTrash /> ลบ
                    </button>
                )}
              <button type="button" onClick={resetForm} className="btn btn-ghost">ยกเลิก</button>
              <button type="submit" className="btn btn-success text-white">
                {isEditMode ? 'บันทึกการเปลี่ยนแปลง' : 'เพิ่มเครื่องจักร'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default Machine;