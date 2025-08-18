import React, { useEffect, useState, useContext } from 'react';
import axios, { AxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';
import { GiVendingMachine } from "react-icons/gi";
import { FaExclamationTriangle } from "react-icons/fa";
import { ImBoxRemove } from "react-icons/im";

import { machinetype } from '../types/machinetype';
import { useMachine } from '../constants/MachineContext';
import { Usercontext } from '../constants/constants';
import { contextType } from '../types/global.type';

// --- Sub-component: Machine Card ---
const MachineCard: React.FC<{ machine: machinetype; onSelect: (id: string) => void }> = ({ machine, onSelect }) => (
  <button
    onClick={() => onSelect(machine.id)}
    className="group flex flex-col items-center justify-center p-6 bg-base-100 rounded-2xl border-2 border-transparent hover:border-primary hover:shadow-xl transition-all duration-300 text-center"
  >
    <GiVendingMachine className="text-6xl text-primary group-hover:scale-110 transition-transform" />
    <h3 className="mt-4 text-xl font-bold text-gray-800">{machine.machineName}</h3>
    <p className="text-sm text-gray-500">{machine.ipAddress}</p>
    

    <div className={`badge mt-3 ${String(machine.status).toLowerCase() === 'online' ? 'badge-success' : 'bg-green-400 text-black'}`}>
      {String(machine.status)}
    </div>
  </button>
);

// --- Sub-component: Skeleton Loader ---
const MachineCardSkeleton: React.FC = () => (
  <div className="p-6 bg-base-100 rounded-2xl animate-pulse ">
    <div className="mx-auto bg-gray-200 rounded-full h-16 w-16"></div>
    <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mt-4"></div>
    <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto mt-2"></div>
    <div className="h-5 bg-gray-200 rounded-full w-20 mx-auto mt-3"></div>
  </div>
);

// --- Main Component: SelectMachine ---
export default function SelectMachine() {
  const [machines, setMachines] = useState<machinetype[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { setSelectedMachineId } = useMachine();
  const navigate = useNavigate();
  const { userData } = useContext(Usercontext) as contextType;

  const baseurl = `${import.meta.env.VITE_APP_API}/machines`;

  useEffect(() => {
    if (!userData?.token) {
      setLoading(false);
      setError("ไม่พบข้อมูลการยืนยันตัวตน (Token)");
      return;
    }

    setLoading(true);
    axios.get(baseurl, { headers: { Authorization: `Bearer ${userData.token}` } })
      .then((res) => {
        const responseData = res.data?.data;
        if (Array.isArray(responseData)) {
      
          const formattedData: machinetype[] = responseData.map((apiItem: any) => ({
            id: apiItem.id,
            machineName: apiItem.machineName, 
            ipAddress: apiItem.ipAddress,     
            status: apiItem.status,        
            MachineStatus: apiItem.status,   
          }));

          console.log("Data from API, check status value and type:", formattedData);
          setMachines(formattedData);
        } else {
          setError("รูปแบบข้อมูลที่ได้รับจากเซิร์ฟเวอร์ไม่ถูกต้อง");
          setMachines([]);
        }
      })
      .catch((err: AxiosError) => {
        console.error('❌ Fetch machines failed:', err);
        const message = (err.response?.data as any)?.message || 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้';
        setError(message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [userData.token, baseurl]);

  const handleSelect = (id: string) => {
    localStorage.setItem('selectedMachineId', id);
    setSelectedMachineId(id);
    navigate('/Home');
  };

  const renderContent = () => {
    if (loading) {
      return (
        <>
          <MachineCardSkeleton />
          <MachineCardSkeleton />
          <MachineCardSkeleton />
        </>
      );
    }
    if (error) {
      return (
        <div className="col-span-1 md:col-span-2 lg:col-span-3 flex flex-col items-center text-center py-10  rounded-lg bg">
          <FaExclamationTriangle className="text-5xl text-red-500 mb-4" />
          <h3 className="text-xl font-bold text-red-700">เกิดข้อผิดพลาด</h3>
          <p className="text-red-600">{error}</p>
        </div>
      );
    }
    if (machines.length === 0) {
      return (
        <div className="col-span-1 md:col-span-2 lg:col-span-3 flex flex-col items-center text-center py-10 bg-gray-100 rounded-lg">
          <ImBoxRemove className="text-5xl text-gray-400 mb-4" />
          <h3 className="text-xl font-bold text-gray-700">ไม่พบเครื่องจักร</h3>
          <p className="text-gray-500">ไม่พบข้อมูลเครื่องจักรที่ลงทะเบียนในระบบ</p>
        </div>
      );
    }
    return machines.map((m) => <MachineCard key={m.id} machine={m} onSelect={handleSelect} />);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-white p-4">
      <div className="w-full max-w-4xl bg-white p-8 rounded-2xl shadow-lg ">
        <div className="text-center mb-8 ">
          <h1 className="text-4xl font-extrabold text-gray-800 ">ยินดีต้อนรับ</h1>
          <p className="mt-2 text-lg text-gray-500 ">กรุณาเลือกเครื่องจักรที่ต้องการใช้งานเพื่อเริ่มต้น</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}