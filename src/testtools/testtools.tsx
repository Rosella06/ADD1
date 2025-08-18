import React, { useState, useEffect, useCallback, useContext } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";
import { Usercontext } from "../constants/constants";
import { contextType } from "../types/global.type";


const Notification: React.FC<{ message: string; type: 'success' | 'error' | 'warning'; onClose: () => void }> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const colorClasses = {
    success: 'alert-success',
    error: 'alert-error',
    warning: 'alert-warning',
  };

  return (
    <div className="toast toast-top toast-end z-50">
      <div className={`alert ${colorClasses[type]}`}>
        <div>
          <span>{message}</span>
        </div>
      </div>
    </div>
  );
};


interface DeviceLogType {
  message: string;
}


const Testtools: React.FC = () => {
  const navigate = useNavigate();
  const [selectedFloor, setSelectedFloor] = useState<number | null>(null);
  const [selectedPosition, setSelectedPosition] = useState<number | null>(null);
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});
  const [queue, setQueue] = useState<{ floor: number; position: number; qty: number; }[]>([]);
  const userData = useContext(Usercontext) as contextType;
  const [deviceLog, setDeviceLog] = useState<string[]>([]);
  const [isM32ModalOpen, setIsM32ModalOpen] = useState(false);
  const [floorOption, setFloorOption] = useState<number | null>(null);
  const [positionOption, setPositionOption] = useState<number | null>(null);
  const [qtyOption, setQtyOption] = useState<number | null>(1);
  const [selectedTray, setSelectedTray] = useState<"L" | "R" | null>(null);

  const [loadingCommands, setLoadingCommands] = useState<string[]>([]);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);

  const machineId = "MID-9b687fb9-64b6-461f-9708-70ac8ac48814";

  useEffect(() => {
    const socket = io("http://localhost:3000");

    socket.on("device", (message: DeviceLogType) => {
      setDeviceLog((prev) => [
        `[${new Date().toLocaleTimeString()}] ${message.message}`,
        ...prev
      ].slice(0, 5));
    });

    return () => {
      socket.disconnect(); // ใช้ disconnect แทน close() จะปลอดภัยกว่า
    };
  }, []);

  const showNotification = (message: string, type: 'success' | 'error' | 'warning') => {
    setNotification({ message, type });

  };


  const sendCommand = useCallback(async (command: string, params?: object) => {
    setLoadingCommands(prev => [...prev, command]);
    try {
      const payload = { command, machineId, ...params };
      console.log("📤 Sending Command:", payload);
      const response = await axios.post(`${import.meta.env.VITE_APP_API}/plc/sendM`, payload, { headers: { Authorization: `Bearer ${userData.userData.token}` } });
      console.log("✅ PLC Response:", response.data);
      showNotification(`ส่งคำสั่ง ${command.toUpperCase()} สำเร็จ!`, 'success');
    } catch (error) {
      console.error(`❌ Command ${command} Failed:`, error);
      showNotification(`ส่งคำสั่ง ${command.toUpperCase()} ล้มเหลว`, 'error');
    } finally {
      setLoadingCommands(prev => prev.filter(c => c !== command));
    }
  }, []);

  const sendQueueCommand = async (floor: number, position: number) => {
    if (!selectedTray) {
      showNotification("กรุณาเลือก Tray (L หรือ R) ก่อน", 'warning'); // <-- [IMPROVEMENT] ใช้ Notification แทน alert
      return;
    }
    const key = `${floor}-${position}`;
    const qty = quantities[key] || 1;
    const commandType = selectedTray === "R" ? "M01" : "M02";

    const commandData = { floor, position, qty, command: commandType, machineId };

    setQueue((prev) => [...prev, { floor, position, qty }]);
    setQuantities((prev) => ({ ...prev, [key]: 0 }));
    showNotification(`เพิ่ม ชั้น ${floor}, ช่อง ${position} จำนวน ${qty} เข้าคิว`, 'success');

    await axios.post(`${import.meta.env.VITE_APP_API}/plc/send`, commandData, { headers: { Authorization: `Bearer ${userData.userData.token}` } })
      .then(response => {
        console.log("📩 API Response:", response.data);
        setQueue(prev => prev.filter(item => !(item.floor === floor && item.position === position)));
      })
      .catch(error => {
        console.error("❌ Error sending queue command:", error);
        showNotification(`เกิดข้อผิดพลาดในการจัดยา ชั้น ${floor}, ช่อง ${position}`, 'error');
        setQuantities(p => ({ ...p, [key]: qty }));
        setQueue(prev => prev.filter(item => !(item.floor === floor && item.position === position)));
      });
  };

  const handleShowOptions = (command: string) => {
    if (command.toLowerCase() === "m32") {
      setIsM32ModalOpen(true);
    } else {
      sendCommand(command);
    }
  };

  const handleSendM32Command = () => {
    if (floorOption !== null && positionOption !== null && qtyOption !== null && qtyOption > 0) {
      sendCommand("m32", { floor: floorOption, position: positionOption, qty: qtyOption });
      setIsM32ModalOpen(false);
    } else {
      showNotification("กรุณากรอกข้อมูลให้ครบถ้วน", 'warning');
    }
  };

  const commandButtons = [
    {
      cmd: "m30",
      label: "รีบูตระบบ",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
          <path d="M3 3v5h5" />
          <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
          <path d="M21 21v-5h-5" />
        </svg>
      ),
    },
    {
      cmd: "m31",
      label: "รีเซตข้อมูล",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 6h18" />
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          <line x1="10" y1="11" x2="10" y2="17" />
          <line x1="14" y1="11" x2="14" y2="17" />
        </svg>
      ),
    },
    {
      cmd: "m32",
      label: "แสดงจำนวนเติมยา",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <line x1="7" y1="10" x2="12" y2="10" />
          <line x1="7" y1="14" x2="10" y2="14" />
          <line x1="14" y1="12" x2="17" y2="12" />
          <line x1="15.5" y1="10.5" x2="15.5" y2="13.5" />
        </svg>
      ),
    },
    {
      cmd: "m33",
      label: "หยุดแสดงไฟเติมยา",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <line x1="9" y1="9" x2="15" y2="15" />
          <line x1="15" y1="9" x2="9" y2="15" />
        </svg>
      ),
    },
    {
      cmd: "m34",
      label: "ปลดล็อกขวา",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 9.9-1" />
        </svg>
      ),
    },
    {
      cmd: "m35",
      label: "ปลดล็อกซ้าย",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 9.9-1" />
        </svg>
      ),
    },
    {
      cmd: "m36",
      label: "หยุดไฟขวา",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1.3.5 2.6 1.5 3.5.7.8 1.3 1.5 1.5 2.5" />
          <path d="M9 18h6" />
          <path d="M10 22h4" />
        </svg>
      ),
    },
    {
      cmd: "m37",
      label: "หยุดไฟซ้าย",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1.3.5 2.6 1.5 3.5.7.8 1.3 1.5 1.5 2.5" />
          <path d="M9 18h6" />
          <path d="M10 22h4" />
        </svg>
      ),
    },
    {
      cmd: "m38",
      label: "สถานะประตู",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 20V6a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v14" />
          <path d="M2 20h20" />
          <path d="M14 12v.01" />
        </svg>
      ),
    },
    {
      cmd: "m39",
      label: "สถานะช่องจ่าย",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
      ),
    },
    {
      cmd: "m40",
      label: "สถานะชั้นเก็บ",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 17h20" />
          <path d="M2 12h20" />
          <path d="M2 7h20" />
          <path d="M5 22v-5" />
          <path d="M12 22v-5" />
          <path d="M19 22v-5" />
          <path d="M5 2h14" />
        </svg>
      ),
    },
  ];
  return (
    <div className="bg-gray-100 min-h-screen font-sans text-gray-800">
      <div className="p-4">
        <button
          onClick={() => navigate("/settings")}
          className="btn btn-outline btn-secondary"
        >
          ⬅ กลับไปที่ Settings
        </button>
      </div>
      {notification && <Notification {...notification} onClose={() => setNotification(null)} />}

      <div className="container mx-auto p-4 md:p-6 space-y-6">


        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          <div className="card bg-white shadow-lg border border-gray-200 rounded-xl">
            <div className="card-body">
              <h2 className="card-title text-lg font-bold">🗄️ รายการกำลังจัด ({queue.length})</h2>
              {queue.length > 0 ? (
                <div className="overflow-x-auto max-h-48">
                  <table className="table table-sm">
                    <thead><tr><th>ชั้น</th><th>ช่อง</th><th>จำนวน</th><th>สถานะ</th></tr></thead>
                    <tbody>
                      {queue.map((item, index) => (
                        <tr key={index} className="hover">
                          <td>{item.floor}</td>
                          <td>{item.position}</td>
                          <td><span className="badge badge-info badge-md text-white">{item.qty}</span></td>
                          <td><span className="loading loading-spinner loading-xs text-primary"></span> กำลังจัด...</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full p-4 bg-blue-50 text-blue-700 rounded-lg"><span>ไม่มีรายการในคิว</span></div>
              )}
            </div>
          </div>


          <div className="card bg-white shadow-lg border border-gray-200 rounded-xl">
            <div className="card-body">
              <h2 className="card-title text-lg font-bold">📡 Log ล่าสุดจาก PLC</h2>
              {deviceLog.length > 0 ? (
                <div className="mockup-code text-xs bg-gray-800 text-white rounded-lg h-48 overflow-y-auto">
                  {deviceLog.map((log, index) => (<pre data-prefix=">" className="text-success" key={index}><code>{log}</code></pre>))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full p-4 bg-yellow-50 text-yellow-700 rounded-lg"><span>ยังไม่มีข้อมูลจาก PLC</span></div>
              )}
            </div>
          </div>
        </div>


        <div className="card bg-white shadow-lg border border-gray-200 rounded-xl">
          <div className="card-body">
            <h2 className="card-title text-lg font-bold">⚙️ Command Center</h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {commandButtons.map((btn) => (
                <button key={btn.cmd} onClick={() => handleShowOptions(btn.cmd)} className="btn btn-outline h-24 flex flex-col gap-1" disabled={loadingCommands.includes(btn.cmd)}>
                  {loadingCommands.includes(btn.cmd) ? <span className="loading loading-spinner"></span> :
                    <>
                      <span className="text-2xl">{btn.icon}</span>
                      <div className="flex flex-col">
                        <span className="font-bold text-sm">{btn.cmd.toUpperCase()}</span>
                        <span className="text-xs normal-case text-gray-500">{btn.label}</span>
                      </div>
                    </>
                  }
                </button>
              ))}
            </div>
          </div>
        </div>


        <dialog id="m32_modal" className={`modal ${isM32ModalOpen ? "modal-open" : ""}`}>
          <div className="modal-box bg-white text-gray-800 rounded-lg">
            <h3 className="font-bold text-lg mb-4">คำสั่ง M32: แสดงจำนวนหน้าโมดูล</h3>
            <div className="space-y-4">
              <label className="input input-bordered flex items-center gap-2"> ชั้นที่: <input type="number" className="grow" placeholder="เช่น 1" value={floorOption ?? ""} onChange={(e) => setFloorOption(Number(e.target.value))} /></label>
              <label className="input input-bordered flex items-center gap-2 "> ช่องที่: <input type="number" className="grow" placeholder="เช่น 5" value={positionOption ?? ""} onChange={(e) => setPositionOption(Number(e.target.value))} /></label>
              <label className="input input-bordered flex items-center gap-2"> จำนวน: <input type="number" className="grow" placeholder="เช่น 10" value={qtyOption ?? ""} onChange={(e) => setQtyOption(Number(e.target.value))} /></label>
            </div>
            <div className="modal-action mt-6">
              <button className="btn btn-ghost" onClick={() => setIsM32ModalOpen(false)}>ยกเลิก</button>
              <button className="btn btn-primary" onClick={handleSendM32Command}>ส่งคำสั่ง</button>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop"> <button onClick={() => setIsM32ModalOpen(false)}>close</button> </form>
        </dialog>


        <div className="card bg-white shadow-lg border border-gray-200 rounded-xl">
          <div className={`card-body transition-all duration-300 rounded-xl ${selectedTray === 'L' ? 'bg-blue-50' : selectedTray === 'R' ? 'bg-green-50' : ''}`}>
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
              <h2 className="card-title text-lg font-bold">💊 จัดการยา (ทุกชั้น)</h2>
              <div className="join border-2 border-primary rounded-lg">
                <button onClick={() => setSelectedTray("L")} className={`btn join-item w-28 ${selectedTray === 'L' ? 'btn-primary' : 'btn-ghost'}`}>Tray L</button>
                <button onClick={() => setSelectedTray("R")} className={`btn join-item w-28 ${selectedTray === 'R' ? 'btn-accent' : 'btn-ghost'}`}>Tray R</button>
              </div>
            </div>


            {!selectedTray && (
              <div role="alert" className="alert alert-warning my-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                <span>กรุณาเลือก Tray L หรือ R เพื่อเริ่มทำการจัดยา</span>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[...Array(7)].map((_, i) => {
                const floorIndex = 7 - i;
                return (
                  <div key={floorIndex} className="p-4 bg-gray-50/50 border border-gray-200/80 rounded-lg">
                    <h3 className="font-bold text-gray-700 mb-3 text-center">ชั้นที่ {floorIndex}</h3>
                    <div className="grid grid-cols-6 gap-2">
                      {[...Array(12)].map((_, positionIndex) => {
                        const position = positionIndex + 1;
                        const key = `${floorIndex}-${position}`;
                        const qty = quantities[key] || 0;
                        const isSelected = selectedFloor === floorIndex && selectedPosition === position;
                        return (
                          <div key={position}
                            className={`card card-compact cursor-pointer transition-all duration-200 border-2 rounded-lg ${isSelected ? "border-primary scale-105 bg-blue-100" : "bg-white border-transparent hover:border-gray-300"}`}
                            onClick={() => { setSelectedFloor(floorIndex); setSelectedPosition(position); }}>
                            <div className="card-body items-center text-center p-2 space-y-1">
                              <p className="font-medium text-[10px] text-gray-500">ช่อง {position}</p>
                              <input type="number" value={qty} onChange={(e) => setQuantities(p => ({ ...p, [key]: Number(e.target.value) }))} className="w-12 text-center text-lg font-bold bg-transparent focus:outline-none" />
                              <div className="join w-full">
                                <button onClick={(e) => { e.stopPropagation(); setQuantities(p => ({ ...p, [key]: Math.max(qty - 1, 0) })) }} className="btn btn-xs join-item btn-outline btn-error flex-1">-</button>
                                <button onClick={(e) => { e.stopPropagation(); setQuantities(p => ({ ...p, [key]: qty + 1 })) }} className="btn btn-xs join-item btn-outline btn-success flex-1">+</button>
                              </div>
                              <button onClick={(e) => { e.stopPropagation(); sendQueueCommand(floorIndex, position); }} className="btn btn-xs btn-primary w-full mt-1" disabled={qty === 0 || !selectedTray}>จัด</button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Testtools;