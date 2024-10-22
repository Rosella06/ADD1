
import { FaClock, FaCheck, FaTimes, FaBan } from 'react-icons/fa';
import { orderType } from '../../types/orderType';

type QueueCardProps = {
  queueData: orderType;
}

export default function Queuecard({ queueData }: QueueCardProps) {
  const { OrderStatus, OrderItemName, Slot, OrderQty, DrugInfo, warning } = queueData;
  console.log('Queuecard Data:', queueData);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case '0':
        return <FaClock className="text-blue-500 text-3xl" />;
      case '1':
        return <div className="w-8 h-8 border-4 border-t-4 border-gray-200 border-t-amber-400 rounded-full animate-spin"></div>;
      case '2':
        return <FaCheck className="text-green-500 text-3xl" />;
      case '3':
        return <FaTimes className="text-orange-600 text-3xl" />;
      default:
        return <FaBan className="text-red-500 text-3xl" />;
    }
  };

  const getStatusBorderBottomColor = (status: string) => {
    switch (status) {
      case '0':
        return 'border-blue-500';
      case '1':
        return 'border-amber-500';
      case '2':
        return 'border-green-500';
      case '3':
        return 'border-orange-600';
      default:
        return 'border-red-500';
    }
  };

  return (

    <div className="w-full sm:w-1/2 md:w-1/2 lg:w-1/2 xl:w-1/2 px-4 mt-10">
    <div
      className={`relative border-b-8 ${getStatusBorderBottomColor(OrderStatus)} rounded-lg shadow-lg flex p-7 bg-white`}
      style={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}>
        <div className="flex-shrink-0 mr-4">
      <img
        src={`${import.meta.env.VITE_APP_IMG}/${DrugInfo?.DrugImage}`}
        className="w-24 h-24 object-cover rounded-lg"
        alt="Drug Image"
      />
    </div>
    <div className="flex-1 flex flex-col">
      <div className="mb-4">
        <h3 className="text-md font-semibold text-black">{OrderItemName}</h3>
      </div>
            <div className="text-black">
              {/* <p className="text-sm font-serif">
                  ชั้น: {BinLocation.substring(0, 1)} ช่อง: {BinLocation.substring(1, 2)}
                </p> */}

            </div>
          <div className="flex justify-between">
        <div className="flex flex-col items-center bg-gray-100 p-2 rounded-lg shadow-lg w-1/2 mr-2">
          <h4 className="text-sm font-serif text-black">จำนวนยา:</h4>
          <span className="text-3xl font-bold text-blue-600">{OrderQty}</span>
        </div>
        <div className="flex flex-col items-center bg-gray-100 p-2 rounded-lg shadow-lg w-1/2 ml-2">
          <h4 className="text-sm font-serif text-black">ช่องรับยา:</h4>
          <span className="text-3xl font-bold text-green-600">{Slot === 'R1' ? '1' : '2'}</span>
        </div>
      </div>

          {warning && (
            <div className="text-sm text-red-600 mt-2">
              <span>{warning.message}</span><br />
              <span>จำนวนที่จัด: {warning.orderQty}</span><br />
              <span>จำนวนคงเหลือ: {warning.inventoryRemaining}</span>
            </div>
          )}
        </div>

        <div className="absolute top-0 right-0 mt-2 mr-2 flex flex-col items-center">
          <div className="mb-1">
            {getStatusIcon(OrderStatus)}
          </div>
          <span className="font-serif text-mb text-black">
            {OrderStatus === '0' ? 'รอจัดยา' :
              OrderStatus === '1' ? 'กำลังจัดยา' :
                OrderStatus === '2' ? 'จัดยาเสร็จ' :
                  OrderStatus === '3' ? 'จัดยาไม่ครบ' :
                    'ยกเลิก'}
          </span>

        </div>
      </div>
    </div>


  );
}
