import { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { machinetype } from '../types/machinetype';
import { useMachine } from '../constants/MachineContext';
import { Usercontext } from '../constants/constants';
import { contextType } from '../types/global.type';

export default function SelectMachine() {
  const [machines, setMachines] = useState<machinetype[]>([]);
  const { setSelectedMachineId } = useMachine();
  const navigate = useNavigate();
  const { userData } = useContext(Usercontext) as contextType;

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_APP_API}/machine`, {
      headers: { Authorization: `Bearer ${userData.token}` },
    })
      .then((res) => {
        console.log('📦 machine data:', res.data);
        setMachines(res.data.data);
      })
      .catch((err) => {
        console.error('❌ Fetch machines failed:', err);
      });
  }, []);

  const handleSelect = (id: string) => {
    localStorage.setItem('selectedMachineId', id);
    console.log('✅ บันทึกเครื่อง:', id);
    setSelectedMachineId(id);
    navigate('/Home');
  };

  return (
    <div className="p-10 backdrop:bg-white">
      <h1 className="text-2xl font-bold mb-5">กรุณาเลือกเครื่องก่อนใช้งาน</h1>
      <div className="grid grid-cols-2 gap-4">
        {machines.map((m) => (
          <button
            key={m.id}
            onClick={() => handleSelect(m.id)}
            className="bg-blue-500 hover:bg-blue-600 text-white p-4 rounded shadow"
          >
            {m.MachineName} ({m.IP})
          </button>
        ))}
      </div>
    </div>
  );
}
