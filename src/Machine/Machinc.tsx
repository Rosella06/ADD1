import React, { useEffect, useState, useContext } from 'react';
import axios, { AxiosError } from 'axios';
import {  FaTrash, FaPlus, FaEdit } from 'react-icons/fa';
import DataTable, { TableColumn } from 'react-data-table-component';
import { Usercontext } from '../constants/constants';
import { machinetype } from '../types/machinetype';
import Swal from 'sweetalert2';
import { contextType } from '../types/global.type';

function Machine() {
  const [machine, setMachine] = useState({ MachineName: '', MachineStatus: '1', IP: '' });
  const [machines, setMachines] = useState<machinetype[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { userData } = useContext(Usercontext) as contextType;

  const [isEditMode, setIsEditMode] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState<machinetype | null>(null);
  const fetchMachine = async () => {
    
    setLoading(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_APP_API}/machine`, {
        headers: { Authorization: `Bearer ${userData.token}` },
      });
      setMachines(response.data.data);
      setError(null);
    } catch (error) {
      if (error instanceof AxiosError) {
        setError(error.response?.data.message || 'เกิดข้อผิดพลาด');
      } else {
        setError('เกิดข้อผิดพลาดไม่ทราบสาเหตุ');
      }
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchMachine();
  }, []);


  const deleteMachine = async (id: string) => {
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
          const response = await axios.delete(`${import.meta.env.VITE_APP_API}/machine/${id}`, {
            headers: { Authorization: `Bearer ${userData.token}` },
          });

          Swal.fire({
            icon: "success",
            title: response.data.message,
            showConfirmButton: false,
            timer: 1500,
          });

          fetchMachine();
        } catch (error) {
          if (error instanceof AxiosError) {
            Swal.fire({
              icon: "error",
              title: "เกิดข้อผิดพลาด",
              text: error.response?.data.message || "ไม่สามารถลบรายการได้",
            });
          }
        }
      }
    });
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const baseurl = `${import.meta.env.VITE_APP_API}/machine`;
    try {
      const { MachineStatus, MachineName, IP } = machine;

      if (MachineName.trim() !== '' && MachineStatus.trim() !== '' && IP.trim() !== '') {
        const data = { MachineName, MachineStatus, IP };

        if (isEditMode && selectedMachine) {
          await axios.put(`${baseurl}/${selectedMachine.id}`, data, {
            headers: {
              Authorization: `Bearer ${userData.token}`,
              'Content-Type': 'application/json',
            },
          });
        } else {
          await axios.post(baseurl, data, {
            headers: {
              Authorization: `Bearer ${userData.token}`,
              'Content-Type': 'application/json',
            },
          });
        }
        setMachine({ MachineName: '', MachineStatus: '1', IP: '' });
        setIsEditMode(false);
        setShowForm(false);

        fetchMachine();

        Swal.fire({
          icon: 'success',
          title: isEditMode ? 'แก้ไขรายการเครื่องจักรเรียบร้อย' : 'เพิ่มรายการเครื่องจักรเรียบร้อย',
          showConfirmButton: false,
          timer: 1500,
        });
      } else {
        Swal.fire({
          icon: 'warning',
          title: 'กรุณากรอกข้อมูลให้ครบ',
          showConfirmButton: false,
          timer: 1500,
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่สามารถบันทึกข้อมูลได้',
      });
    }
  };
const editMachine = (machine: machinetype) => {
  setSelectedMachine(machine);
  setMachine({
    MachineName: machine.MachineName,
    MachineStatus: machine.MachineStatus,
    IP: machine.IP,
  });
  setIsEditMode(true);
  setShowForm(true);
};

  const columns: TableColumn<machinetype>[] = [
    {
      name: 'id',
      sortable: true,
      cell: (row) => (
        <div
          style={{
            whiteSpace: 'normal',
            wordWrap: 'break-word',
            maxWidth: '150px',
            overflowWrap: 'break-word',
          }}
        >
          {row.id}
        </div>
      ),
    },
    {
      name: 'ชื่อเครื่อง',
      selector: (row) => row.MachineName,
      sortable: true,
    },
    {
      name: 'IP',
      selector: (row) => row.IP,
      sortable: true,
    },
    {
      name: 'สถานะ',
      selector: (row) => (row.MachineStatus === '1' ? 'ใช้งาน' : 'ไม่ใช้งาน'),
      sortable: true,
    },
    {
      name: 'จัดการ',
      cell: (item) => (
        <div className="flex space-x-3 text-xl">
          <button onClick={() => editMachine(item)} className="text-yellow-500 hover:text-yellow-700">
            <FaEdit />
          </button>
          <button onClick={() => deleteMachine(item.id)} className="text-red-500 hover:text-red-700">
            <FaTrash />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col items-center py-0 bg-gray-100">
      <div className="card w-full h-screen p-7 bg-white shadow-xl text-blue-800 rounded-none">
        <div className="flex justify-between items-center">
          <div className="text-4xl font-bold">Machine</div>
          <div className="flex items-center">
            <input
              type="text"
              placeholder="ค้นหาชื่อเครื่อง..."
              className="input border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 rounded-lg mr-2 bg-white"
            />
            <button
              onClick={() => {
                setShowForm(true);
                setIsEditMode(false);
                setMachine({ MachineName: '', MachineStatus: '1', IP: '' });
              }}
              className="btn bg-green-500 text-white hover:bg-green-400 transition duration-300"
            >
              <FaPlus />
            </button>
          </div>
        </div>

        <div className="divider mt-2"></div>
        <div className="h-full w-full overflow-x-auto flex-grow bg-white">
          <DataTable
            columns={columns}
            data={machines}
            paginationPerPage={10}
            pagination
            responsive
            progressPending={loading}
            customStyles={{
              table: {
                style: {
                  width: '100%',
                  tableLayout: 'fixed',
                },
              },
              headRow: {
                style: {
                  backgroundColor: '#f1f5f9',
                },
              },
              cells: {
                style: {
                  padding: '8px',
                  textAlign: 'center',
                  fontSize: '14px',
                },
              },
            }}
          />
          {error && (
            <div className="text-red-600 font-semibold mt-4 text-center">
              {error}
            </div>
          )}
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-lg">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-2xl font-bold text-center mb-4 text-blue-800">
                {isEditMode ? 'แก้ไขเครื่องจักร' : 'เพิ่มเครื่องจักร'}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-red-500 font-bold text-2xl leading-none"
                aria-label="Close form"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex flex-col">
                <label htmlFor="MachineName" className="block text-sm font-medium text-gray-900">
                  ชื่อเครื่อง
                </label>
                <input
                  type="text"
                  id="MachineName"
                  value={machine.MachineName}
                  onChange={(e) => setMachine({ ...machine, MachineName: e.target.value })}
                  className="p-2 border border-gray-300 rounded bg-white text-zinc-700"
                  required
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="IP" className="block text-sm font-medium text-gray-900">
                  IP
                </label>
                <input
                  type="text"
                  id="IP"
                  value={machine.IP}
                  onChange={(e) => setMachine({ ...machine, IP: e.target.value })}
                  className="p-2 border border-gray-300 rounded bg-white text-zinc-700"
                  required
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="MachineStatus" className="block text-sm font-medium text-gray-900">
                  สถานะ
                </label>
                <select
                  id="MachineStatus"
                  value={machine.MachineStatus}
                  onChange={(e) => setMachine({ ...machine, MachineStatus: e.target.value })}
                  className="p-2 border border-gray-300 rounded bg-white text-zinc-700"
                  required
                >
                  <option value="1">ใช้งาน</option>
                  <option value="0">ไม่ใช้งาน</option>
                </select>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setIsEditMode(false);
                    setMachine({ MachineName: '', MachineStatus: '1', IP: '' });
                    setSelectedMachine(null);
                  }}
                  className="btn btn-outline btn-error"
                >
                  ยกเลิก
                </button>
                <button type="submit" className="btn bg-green-500 text-white hover:bg-green-600 transition duration-300">
                  {isEditMode ? 'บันทึกการแก้ไข' : 'เพิ่มเครื่องจักร'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Machine;
