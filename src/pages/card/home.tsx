import { useContext, useEffect, useState } from 'react';
import axios, { AxiosError } from 'axios';
import { orderType } from '../../types/orderType';
import { Toast } from '../../utils/swal';
import Queuedetails from './queuedetails';
import { socket } from '../../utils/websocket';
import { AxiosResponse, contextType } from '../../types/global.type';
import { Usercontext } from '../../constants/constants';
import Swal from 'sweetalert2';

export default function Home() {
  const [order, setOrder] = useState<orderType[]>([]);
  const { userData } = useContext(Usercontext) as contextType;
  const { token } = userData;
  const [socketData, setSocketData] = useState('');
  const [qr, setQr] = useState('');
  let value_id = '';

  useEffect(() => {
    document.addEventListener('keypress', onBarcodeScan);
  }, []);

  const onBarcodeScan = async (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      setQr(value_id);
      value_id = '';
    } else {
      value_id += e.key;
    }
  };

  const fetchDataQr = async (path: string) => {
    try {
      const response = await axios.get(path, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrder(response.data.data);
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
      const response = await axios.get<AxiosResponse<orderType[]>>(`${import.meta.env.VITE_APP_API}/orders`, {
        headers: { authorization: `Bearer ${userData.token}` }
      });
      setOrder(response.data.data.filter((items) => items.OrderStatus !== '4'));
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error("Error fetching data:", error.response?.data);
      } else {
        console.error("Unknown error:", error);
      }
    }
  };


  useEffect(() => {
    if (qr !== '') {
      if (qr.length === 1) {
        fetchDataQr(`${import.meta.env.VITE_APP_API}/orders/dispense/${qr}`);
      } else {
        fetchDataQr(`${import.meta.env.VITE_APP_API}/orders/receive/${qr}`);
      }
    }
  }, [qr]);

  useEffect(() => {
    fetchData();
  }, [socketData]);

  useEffect(() => {
    socket.on('res_message', (response) => {
      setSocketData(response);
    });
  }, []);

  const clearOrders = async () => {
    try {
      const response = await axios.get<AxiosResponse<orderType>>(`${import.meta.env.VITE_APP_API}/orders/clear`, {
        headers: { authorization: `Bearer ${userData.token}` }
      });
      Swal.fire({
        icon: "success",
        title: response.data.message,
        showConfirmButton: false,
        timer: 1500,
      });

      window.location.reload();
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error(error.response?.data.message);
      } else {
        console.error(error);
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
