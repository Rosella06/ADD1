import { useContext, useEffect, useState } from 'react';
import axios, { AxiosError } from 'axios';
import { ordersType, prescriptionType } from '../../types/orderType';
import { Toast } from '../../utils/swal';
import Queuedetails from './queuedetails';
import { socket } from '../../utils/websocket';
import { AxiosResponse, contextType } from '../../types/global.type';
import { Usercontext } from '../../constants/constants';
import Swal from 'sweetalert2';

export default function Home() {
  const [order, setOrder] = useState<ordersType[]>([]);
  const { userData } = useContext(Usercontext) as contextType;
  const { token } = userData;
  const [socketData, setSocketData] = useState('');
  const [qr, setQr] = useState('');
  let value_id = '';

  useEffect(() => {
    document.addEventListener('keypress', onBarcodeScan);
    return () => document.removeEventListener('keypress', onBarcodeScan);
  }, []);

  const onBarcodeScan = async (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      setQr(value_id);
      value_id = '';
    } else {
      value_id += e.key;
    }
  };

  const fetchDataQr = async (url: string) => {
    try {
      const machineId = localStorage.getItem('selectedMachineId');
      console.log('👉 POST URL:', url);
      console.log('📦 Body:', { machineId });

      const response = await axios.post(url, { machineId }, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('✅ Response:', response.data);
      if (response.data?.data) {
        setOrder(response.data.data);
      } else {
        console.warn('❗ ไม่มีข้อมูลใน response.data');
      }
      setQr('');
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        console.error(error);
        Toast.fire({
          icon: 'error',
          text: error.response?.data.error || 'Unknown Error!',
        });
      } else {
        Toast.fire({
          icon: 'error',
          text: 'Unknown Error!',
        });
      }
      setQr('');
    }
  };


  const fetchData = async () => {
    try {
      const response = await axios.get<AxiosResponse<prescriptionType>>(`${import.meta.env.VITE_APP_API}/orders`, {
        headers: { authorization: `Bearer ${token}` }
      });
      setOrder(response.data.data.orders.filter((items) => items.status !== 'pickup'));
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error("Error fetching data:", error.response?.data);
      } else {
        console.error("Unknown error:", error);
      }
    }
  };


  const dispenseAndPickup = async (qrParams: string) => {
    if (qrParams.length === 1) {
      await fetchDataQr(`${import.meta.env.VITE_APP_API}/orders/dispense/${qrParams}`);
    } else if (order.length > 0) {
      const presNo = qrParams.split("|")[0]
      const drugCode = qrParams.split("|")[1]
      await fetchDataQr(`${import.meta.env.VITE_APP_API}/orders/pickup/${presNo}/${drugCode}`);
    } else {
      console.warn('⚠️ ข้าม fetchDataQr เพราะไม่มี order[0]');
    }
  }

  useEffect(() => {
    if (!qr) return;

    dispenseAndPickup(qr)
  }, [qr, order]);

  useEffect(() => {
    fetchData();
  }, [socketData]);


  useEffect(() => {
    socket.on('drug_dispensed', (response) => {
      setSocketData(response);
    });

    return () => {
      socket.off('drug_dispensed');
    };
  }, []);

  const clearOrders = async () => {
    try {
      const machineId = localStorage.getItem('selectedMachineId');
      if (!machineId) {
        return Swal.fire({
          icon: 'error',
          title: 'ไม่พบเครื่อง',
          text: 'กรุณาเลือกเครื่องก่อน'
        });
      }

      // เปลี่ยนเป็น DELETE และส่ง machineId ใน data
      const response = await axios.delete(`${import.meta.env.VITE_APP_API}/orders/order`, {
        headers: { authorization: `Bearer ${token}` },
        data: { machineId }
      });

      Swal.fire({
        icon: "success",
        title: response.data.message || `ล้างรายการเรียบร้อย`,
        showConfirmButton: false,
        timer: 1500,
      });

      setOrder([]); // ล้าง order ใน frontend โดยไม่ต้อง reload หน้า
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error(error.response?.data);
        Swal.fire({
          icon: "error",
          title: "เกิดข้อผิดพลาด",
          text: error.response?.data?.message || 'Unknown error',
        });
      } else {
        console.error(error);
        Swal.fire({
          icon: "error",
          title: "เกิดข้อผิดพลาด",
          text: 'Unknown error',
        });
      }
    }
  };


  return (
    <>
      <Queuedetails queueData={order} clearOrders={clearOrders} />
      <span>{qr}</span>
    </>
  );
}
