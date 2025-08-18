import React, { useState, useEffect, useCallback } from 'react';
import { FaExclamationTriangle, FaFileAlt, FaWarehouse, FaPrescriptionBottleAlt, FaSearch } from 'react-icons/fa';

import { ImBoxRemove } from "react-icons/im";

// --- Type Definitions (ไม่เปลี่ยนแปลง) ---
type Drug = {
  Drugcode: string;
  DrugName: string;
  DrugStatus: boolean;
  DrugImage?: string | null;
  CreatedAt: string;
  UpdatedAt: string;
};

type Inventory = {
  id: string;
  InventoryPosition: number;
  InventoryQty: number;
  Min: number;
  Max: number;
  InventoryStatus: boolean;
  Drug: Drug;
  CreatedAt: string;
  UpdatedAt: string;
  Expiydate?: string | null;
  InventoryFloor: number;
};

// --- Helper Functions (ไม่เปลี่ยนแปลง) ---
const getTodayString = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

// --- [REFINED] Reusable UI Components ---

// Skeleton Loader for tables
const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => (
  <div className="space-y-3 p-4 animate-pulse">
    {[...Array(rows)].map((_, i) => (
      <div key={i} className="h-10 bg-gray-200 rounded-lg w-full"></div>
    ))}
  </div>
);

// Placeholder for Empty or Error states
const ReportPlaceholder: React.FC<{
  icon: React.ReactNode;
  title: string;
  message: string;
}> = ({ icon, title, message }) => (
  <div className="flex flex-col items-center justify-center text-center py-12 px-4 bg-gray-50 rounded-lg">
    <div className="text-4xl text-gray-400 mb-3">{icon}</div>
    <p className="text-lg font-semibold text-gray-700">{title}</p>
    <p className="text-sm text-gray-500 max-w-sm">{message}</p>
  </div>
);

// [NEW] Stat Card Component
const StatCard: React.FC<{
    icon: React.ReactNode;
    title: string;
    value: number | null;
    unit: string;
    loading: boolean;
    error: string;
    date: string;
    setDate: (date: string) => void;
    onSearch: () => void;
    colorClass: string;
}> = ({ icon, title, value, unit, loading, error, date, setDate, onSearch, colorClass }) => (
    <div className={`bg-white p-6 rounded-2xl shadow-lg border border-gray-200/80 flex flex-col justify-between ${colorClass}`}>
        <div>
            <div className="flex items-center gap-4">
                <div className="text-3xl opacity-80">{icon}</div>
                <h3 className="text-lg font-bold">{title}</h3>
            </div>
            <div className="text-center my-6">
                {loading ? <span className="loading loading-spinner loading-lg"></span> :
                 error ? <FaExclamationTriangle className="text-error text-4xl mx-auto" /> :
                 value !== null ? (
                    <p className="text-5xl font-extrabold">{value.toLocaleString()}</p>
                 ) : (
                    <p className="text-4xl font-bold text-gray-400">-</p>
                 )
                }
                <p className="text-sm font-medium mt-1 opacity-70">{error || unit}</p>
            </div>
        </div>
        <div className="flex items-center gap-2 mt-4 border-t border-black/10 pt-4">
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className="input input-sm input-bordered w-full"/>
            <button onClick={onSearch} disabled={loading} className="btn btn-sm btn-active">
                <FaSearch />
            </button>
        </div>
    </div>
);


// --- Main Component: ReportsPage ---
export default function ReportsPage() {
  // State for report filters
  const [drugStartDate, setDrugStartDate] = useState(getTodayString());
  const [drugEndDate, setDrugEndDate] = useState(getTodayString());
  const [inventoryDate, setInventoryDate] = useState(getTodayString());
  const [prescriptionDate, setPrescriptionDate] = useState(getTodayString());

  // Data States
  const [drugReport, setDrugReport] = useState<Drug[] | null>(null);
  const [inventoryReport, setInventoryReport] = useState<Inventory[] | null>(null);
  const [prescriptionCount, setPrescriptionCount] = useState<number | null>(null);

  // Loading & Error States
  const [drugLoading, setDrugLoading] = useState(false);
  const [inventoryLoading, setInventoryLoading] = useState(false);
  const [prescriptionLoading, setPrescriptionLoading] = useState(false);
  const [drugError, setDrugError] = useState('');
  const [inventoryError, setInventoryError] = useState('');
  const [prescriptionError, setPrescriptionError] = useState('');

  // --- API Fetching Functions ---
  const fetchDrugReport = useCallback(async () => {
    setDrugLoading(true);
    setDrugError('');
    try {
      await new Promise(resolve => setTimeout(resolve, 1200)); // Fake API
      // const response = await axios.get(`/api/reports/drugs?start=${drugStartDate}&end=${drugEndDate}`);
      const mockData: Drug[] = []; // Replace with actual API data
      setDrugReport(mockData);
    } catch (err) {
      setDrugError('ไม่สามารถโหลดข้อมูลยาได้');
    } finally {
      setDrugLoading(false);
    }
  }, [drugStartDate, drugEndDate]);

  const fetchInventoryReport = useCallback(async () => {
    setInventoryLoading(true);
    setInventoryError('');
    try {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Fake API
        // const response = await axios.get(`/api/reports/inventory?date=${inventoryDate}`);
        const mockData: Inventory[] = []; // Replace with actual API data
        setInventoryReport(mockData);
    } catch (err) {
        setInventoryError('ไม่สามารถโหลดข้อมูลคลังยาได้');
    } finally {
        setInventoryLoading(false);
    }
  }, [inventoryDate]);

  const fetchPrescriptionCount = useCallback(async () => {
    setPrescriptionLoading(true);
    setPrescriptionError('');
    try {
      await new Promise(resolve => setTimeout(resolve, 800)); // Fake API
      // const response = await axios.get(`/api/reports/prescriptions?date=${prescriptionDate}`);
      const mockCount = Math.floor(Math.random() * 25); // Replace with actual API data
      setPrescriptionCount(mockCount);
    } catch (err) {
      setPrescriptionError('ไม่สามารถโหลดข้อมูลใบยาได้');
    } finally {
      setPrescriptionLoading(false);
    }
  }, [prescriptionDate]);

  useEffect(() => {
    fetchPrescriptionCount();
  }, [fetchPrescriptionCount]);

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">ภาพรวมรายงาน</h1>
        <p className="text-gray-500 mb-8">สรุปข้อมูลและรายงานต่างๆ จากระบบ</p>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Stat Card Section */}
            <StatCard 
                icon={<FaPrescriptionBottleAlt />}
                title="ใบยาที่จัดในเครื่อง"
                value={prescriptionCount}
                unit="ใบ"
                loading={prescriptionLoading}
                error={prescriptionError}
                date={prescriptionDate}
                setDate={setPrescriptionDate}
                onSearch={fetchPrescriptionCount}
                colorClass="text-purple-600"
            />
            {/* สามารถเพิ่ม StatCard อื่นๆ ได้ที่นี่ */}

            {/* Drug Report Section */}
            <div className="lg:col-span-3 bg-white p-6 rounded-2xl shadow-lg border border-gray-200/80">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-3"><FaFileAlt className="text-blue-500"/>รายงานยา</h2>
                    <div className="flex items-center gap-2 flex-wrap">
                        <input type="date" value={drugStartDate} onChange={e => setDrugStartDate(e.target.value)} className="input input-sm input-bordered" />
                        <span className="text-gray-500">ถึง</span>
                        <input type="date" value={drugEndDate} onChange={e => setDrugEndDate(e.target.value)} className="input input-sm input-bordered"/>
                        <button onClick={fetchDrugReport} disabled={drugLoading} className={`btn btn-sm btn-primary ${drugLoading ? 'loading' : ''}`}>ค้นหา</button>
                    </div>
                </div>

                {drugLoading ? <TableSkeleton /> : 
                drugError ? <ReportPlaceholder icon={<FaExclamationTriangle className="text-error"/>} title="เกิดข้อผิดพลาด" message={drugError} /> :
                drugReport && drugReport.length > 0 ? (
                    <div className="overflow-x-auto">
                    <table className="table table-zebra w-full">
                        <thead><tr><th>รหัสยา</th><th>ชื่อยา</th><th>สถานะ</th><th>อัปเดตล่าสุด</th></tr></thead>
                        <tbody>
                        {drugReport.map(drug => (
                            <tr key={drug.Drugcode}>
                                <td><code className="text-sm">{drug.Drugcode}</code></td>
                                <td className="font-medium">{drug.DrugName}</td>
                                <td><span className={`badge ${drug.DrugStatus ? 'badge-success' : 'badge-ghost'}`}>{drug.DrugStatus ? 'ใช้งาน' : 'ยกเลิก'}</span></td>
                                <td>{new Date(drug.UpdatedAt).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                    </div>
                ) : <ReportPlaceholder icon={<ImBoxRemove />} title="ไม่พบข้อมูล" message="ไม่พบข้อมูลยาในช่วงวันที่ที่ท่านเลือก กรุณาลองใหม่อีกครั้ง" />}
            </div>

            {/* Inventory Report Section */}
            <div className="lg:col-span-3 bg-white p-6 rounded-2xl shadow-lg border border-gray-200/80">
                 <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-3"><FaWarehouse className="text-green-500"/>รายงานคงคลัง</h2>
                    <div className="flex items-center gap-2 flex-wrap">
                         <input type="date" value={inventoryDate} onChange={e => setInventoryDate(e.target.value)} className="input input-sm input-bordered"/>
                         <button onClick={fetchInventoryReport} disabled={inventoryLoading} className={`btn btn-sm btn-accent text-white ${inventoryLoading ? 'loading' : ''}`}>ค้นหา</button>
                    </div>
                </div>
                 {inventoryLoading ? <TableSkeleton /> : 
                 inventoryError ? <ReportPlaceholder icon={<FaExclamationTriangle className="text-error"/>} title="เกิดข้อผิดพลาด" message={inventoryError} /> :
                 inventoryReport && inventoryReport.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="table table-zebra w-full">
                            <thead><tr><th>ชื่อยา</th><th>ชั้น</th><th>ช่อง</th><th>คงเหลือ</th><th>วันหมดอายุ</th></tr></thead>
                            <tbody>
                                {inventoryReport.map(inv => (
                                <tr key={inv.id}>
                                    <td className="font-medium">{inv.Drug?.DrugName || 'N/A'}</td>
                                    <td>{inv.InventoryFloor}</td>
                                    <td>{inv.InventoryPosition}</td>
                                    <td className="font-bold">{inv.InventoryQty}</td>
                                    <td>{inv.Expiydate ? new Date(inv.Expiydate).toLocaleDateString('th-TH') : '-'}</td>
                                </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                 ) : <ReportPlaceholder icon={<ImBoxRemove />} title="ไม่พบข้อมูล" message="ไม่พบข้อมูลสินค้าคงคลังในวันที่ท่านเลือก กรุณาลองใหม่อีกครั้ง"/>}
            </div>
        </div>
      </div>
    </div>
  );
}