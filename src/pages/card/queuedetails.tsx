import logo from "../../img/6.png";
import { ordersType } from "../../types/orderType";
import Queuecard from "./queuecard";
import { IoMdLogOut } from 'react-icons/io';
import cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { contextType } from "../../types/global.type";
import { useContext, useEffect, useState } from "react";
import { Usercontext } from "../../constants/constants";
import defaultImage from '../../img/user.png';
import DataTable, { TableColumn } from "react-data-table-component";
import { Prescription } from "../../types/Prescription";
import axios from "axios";
import { io } from "socket.io-client";

type queuelistType = {
  queueData?: ordersType[];
  clearOrders: () => void;
};

export default function Queuedetails({ queueData = [], clearOrders }: queuelistType) {
  const { userData } = useContext(Usercontext) as contextType;
  const { userRole } = userData;
  const navigate = useNavigate();

  const [filteredPrescriptionList] = useState<Prescription[]>([]);
  const [plcErrors, setPlcErrors] = useState<{ status: string; message: string; command: string; timestamp: string }[]>([]);
  const [plcLogs, setPlcLogs] = useState<string[]>([]);
  const [plcFinishedTask, setPlcFinishedTask] = useState<{
    status: string;
    message: string;
    timestamp: string;
    machineId: string;
  } | null>(null);

  const handleLogout = () => {
    cookies.remove('userData');
    navigate('/login');
    Swal.fire({
      title: 'Logged out',
      text: 'You have been logged out successfully.',
    });
  };

  useEffect(() => {
    const socket = io("ws://localhost:3000");

    socket.on("connect", () => {
      console.log("✅ Connected to socket");
    });

    socket.on("plc-error", (data) => {
      console.warn("📛 PLC Error Received:", data);
      setPlcErrors((prev) => [...prev, data]);

      const errorCodesToAlert = ['02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14'];
      const match = data.message.match(/-> (\d{2})/);
      const code = match?.[1];

      if (code && errorCodesToAlert.includes(code)) {
        Swal.fire({
          icon: 'error',
          title: `เกิดข้อผิดพลาดจากเครื่อง (${code})`,
          html: `
            <p><strong>${data.message}</strong></p>
            <p class="mt-2">กรุณากด <span class="font-bold text-blue-600">รีบูตระบบ</span> หรือติดต่อช่าง</p>
          `,
          showCancelButton: true,
          confirmButtonText: 'รีบูตระบบ',
          cancelButtonText: 'ปิด',
          confirmButtonColor: '#0ea5e9',
        }).then((result) => {
          if (result.isConfirmed) {
            sendM30Command();
          }
        });
      }
    });

    socket.on("plc-log", (msg: string) => {
      setPlcLogs((prev) => [...prev.slice(-19), msg]);
    });

    socket.on("plc-finish-task", (data) => {
      console.log("✅ Finish Task from PLC:", data);
      setPlcFinishedTask(data);

      Swal.fire({
        icon: "success",
        title: "ทำงานเสร็จแล้ว",
        html: `<strong>${data.message}</strong><br/>เครื่อง: ${data.machineId}`,
        timer: 2500,
        showConfirmButton: false,
      });
    });

    return () => {
      socket.close();
    };
  }, []);

  // Auto clear finish message after 5s
  useEffect(() => {
    if (plcFinishedTask) {
      const timer = setTimeout(() => setPlcFinishedTask(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [plcFinishedTask]);

  const sendM30Command = async () => {
    try {
      const machineId = localStorage.getItem('selectedMachineId');
      if (!machineId) {
        return Swal.fire({
          icon: 'error',
          title: 'ไม่พบเครื่อง',
          text: 'กรุณาเลือกเครื่องก่อน',
        });
      }

      await axios.post(`${import.meta.env.VITE_APP_API}/plc/sendM`, {
        command: 'm30',
        machineId,
      }, {
        headers: { authorization: `Bearer ${userData.token}` },
      });

      Swal.fire({
        icon: "success",
        title: "ส่งคำสั่ง m30 เรียบร้อย",
        showConfirmButton: false,
        timer: 1500,
      });

    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: "ไม่สามารถส่งคำสั่ง m30 ได้",
      });
    }
  };

  const columns: TableColumn<Prescription>[] = [
    {
      name: 'ช่องยาที่',
      selector: row => row.PriorityCode,
      sortable: true,
    },
    {
      name: 'ชื่อยา',
      selector: row => row.Hn,
      sortable: true,
    },
    {
      name: 'Order Status',
      selector: row => row.Order[0]?.status || 'N/A',
      sortable: true,
    },
    {
      name: 'Created At',
      selector: row => new Date(row.CreatedAt).toLocaleString(),
      sortable: true,
    },
    {
      name: 'Updated At',
      selector: row => new Date(row.UpdatedAt).toLocaleString(),
      sortable: true,
    }
  ];

  return (
    <div className="bg-gradient-to-b w-full h-[1700px] bg-blue-100 flex flex-col">
      {userRole !== 'ADMIN' && (
        <header className="bg-blue-900 w-full py-14 px-9 fixed top-0 left-0 z-10 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="flex justify-center items-center">
              {userData.userImage ? (
                <img
                  src={`${import.meta.env.VITE_APP_IMG}${userData.userImage}`}
                  alt="User Profile"
                  className="rounded-full h-28 w-28"
                />
              ) : (
                <img
                  src={defaultImage}
                  alt="Default User"
                  className="rounded-full h-28 w-28"
                />
              )}
            </div>
            <span className="text-white text-4xl font-semibold">{userData.displayName}</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 px-4 py-2 text-red-500 hover:bg-red-300 rounded-lg"
          >
            <IoMdLogOut className="text-5xl" />
            <span className="text-2xl">Logout</span>
          </button>
        </header>
      )}

      <main className="flex-grow h-screen pt-[30px] px-2">
        {plcFinishedTask && (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 m-4 rounded shadow-md">
            ✅ <strong>{plcFinishedTask.message}</strong><br />
            📅 {new Date(plcFinishedTask.timestamp).toLocaleString()}<br />
            🏭 เครื่อง: {plcFinishedTask.machineId}
          </div>
        )}

        {plcErrors.length > 0 && (
          <div className="p-6">
            <h2 className="text-2xl font-semibold text-red-600 mb-3"> ข้อผิดพลาดจากตู้ADD </h2>
            <div className="grid grid-cols-3 gap-4">
              {plcErrors.slice(-3).map((err, idx) => (
                <div key={idx} className="bg-white rounded-lg shadow p-4 border-l-4 border-red-500">
                  <div className="text-black"><span className="font-bold"></span> {err.message}</div>
                  <div className="text-sm text-gray-500">{new Date(err.timestamp).toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {plcLogs.length > 0 && (
          <div className="p-6 pt-0">
            <h2 className="text-2xl font-semibold text-gray-700 mb-3">📄 รายงานจาก PLC</h2>
            <div className="bg-white p-4 rounded-lg shadow max-h-[300px] overflow-y-auto text-sm text-gray-800 space-y-1">
              {plcLogs.map((log, index) => (
                <div key={index}>• {log}</div>
              ))}
            </div>
          </div>
        )}

        {Array.isArray(queueData) && queueData.length > 0 ? (
          <>
            <span className="flex justify-center text-8xl font-extrabold text-yellow-400 py-12 bg-gradient-to-r from-blue-900 to-blue-700 text-transparent bg-clip-text">
              รายการยา
            </span>

            <div className="p-10 max-h-[calc(100vh-5px)] overflow-y-auto flex-grow">
              <div className="flex flex-wrap -mx-4">
                {queueData.map((items, index) => (
                  <Queuecard queueData={items} key={index} />
                ))}
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="overflow-x-auto text-black p-6">
              <DataTable
                columns={columns}
                data={filteredPrescriptionList}
                paginationPerPage={10}
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
                  }
                }}
              />
            </div>

            <div className="flex flex-col items-center justify-center text-center">
              <img
                src={logo}
                alt="Medicine Cabinet"
                className="w-[500px] h-[650px] object-contain mb-10"
              />
              <div className="flex flex-col items-center justify-center animate-bounce">
                <span className="text-4xl font-bold text-center w-full text-[#338] px-8 py-5 bg-gradient-to-r from-white via-gray-100 to-white rounded-2xl shadow-lg -mt-[50px] inline-block">
                  สแกน Qr code ใบสั่งยา
                </span>
              </div>
            </div>
          </>
        )}
      </main>

      <div className="flex justify-end p-20 gap-3">
        <button
          onClick={clearOrders}
          className="px-4 py-2 bg-red-600 text-white rounded-lg"
        >
          ล้างรายการทั้งหมด
        </button>
        <button onClick={sendM30Command} className="btn bg-sky-400 text-white hover:bg-cyan-500 transition duration-300 px-3 h-10 text-sm">
          รีบูตระบบ
        </button>
      </div>
    </div>
  );
}
