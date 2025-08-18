import { createContext, useContext, useState, useEffect } from 'react';

type MachineContextType = {
  selectedMachineId: string | null;
  setSelectedMachineId: (id: string | null) => void;
};

const MachineContext = createContext<MachineContextType | undefined>(undefined);

export const MachineProvider = ({ children }: { children: React.ReactNode }) => {
  const [selectedMachineId, setSelectedMachineIdState] = useState<string | null>(null);

  useEffect(() => {
    // โหลดจาก localStorage ตอนเปิดแอป
    const saved = localStorage.getItem('selectedMachineId');
    if (saved) setSelectedMachineIdState(saved);
  }, []);

  const setSelectedMachineId = (id: string | null) => {
    setSelectedMachineIdState(id);
    if (id) {
      localStorage.setItem('selectedMachineId', id);
    } else {
      localStorage.removeItem('selectedMachineId');
    }
  };

  return (
    <MachineContext.Provider value={{ selectedMachineId, setSelectedMachineId }}>
      {children}
    </MachineContext.Provider>
  );
};

export const useMachine = () => {
  const context = useContext(MachineContext);
  if (!context) {
    throw new Error('useMachine ต้องใช้ภายใน <MachineProvider>');
  }
  return context;
};
