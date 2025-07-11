import { FaClock, FaCheck, FaTimes, FaHandHoldingMedical } from 'react-icons/fa';
import { orderType } from '../../types/orderType';

type QueueCardProps = {
  queueData: orderType;
};

export default function Queuecard({ queueData }: QueueCardProps) {
  const { OrderStatus, OrderItemName, Slot, OrderQty, DrugInfo, warning } = queueData;

  if (OrderStatus === 'complete') {
    return null;
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ready':
        return <FaClock className="text-slate-600 text-3xl" />;
      case 'pending':
        return (
          <div className="w-8 h-8 border-4 border-t-4 border-gray-200 border-t-amber-400 rounded-full animate-spin"></div>
        );
      case 'receive':
        return <FaCheck className="text-green-500 text-3xl" />;
      case 'complete':
        return <FaHandHoldingMedical className="text-green-500 text-3xl" />;
      default:
        return <FaTimes className="text-red-500 text-3xl" />;
    }
  };

  const getSmallStatusIcon = (status: string) => {
    switch (status) {
      case 'ready':
        return <FaClock className="text-slate-600 text-2xl" />;
      case 'pending':
        return (
          <div className="w-6 h-6 border-2 border-t-2 border-gray-200 border-t-amber-400 rounded-full animate-spin"></div>
        );
      case 'error':
        return <FaTimes className="text-red-500 text-2xl" />;
      default:
        return <FaTimes className="text-red-500 text-2xl" />;
    }
  };

  const getStatusBorderBottomColor = (status: string) => {
    switch (status) {
      case 'receive':
        return 'border-green-500';
      case 'pending':
        return 'border-amber-500';
      case 'complete':
        return 'border-green-500';
      case 'ready':
        return 'border-slate-600';
      default:
        return 'border-red-500';
    }
  };

  const getReceivePositionClass = () => {
    return Slot === 'M01'
      ? 'fixed bottom-10 right-[-2px] z-50'
      : 'fixed bottom-10 left-0.5 z-50';
  };

  const cardPositionClass = OrderStatus === 'receive' ? getReceivePositionClass() : 'relative';
 const getStatusBackgroundColor = (status: string) => {
    switch (status) {
      case 'ready':
        return 'bg-slate-200';
      case 'pending':
        return 'bg-amber-100';
      case 'receive':
        return 'bg-green-100';
      case 'complete':
        return 'bg-green-100';
      case 'error':
        return 'bg-red-100';
      default:
        return 'bg-gray-100';
    }
  }
  return (
    <div className={`w-full sm:w-1/2 md:w-1/2 lg:w-1/2 xl:w-1/2 px-1 mt-10 ${cardPositionClass}`}>
      <div
       className={`relative border-b-8 ${getStatusBorderBottomColor(OrderStatus)} ${getStatusBackgroundColor(OrderStatus)} rounded-lg shadow-lg flex p-7`}
        style={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}
      >

        <div className="flex-shrink-0 mr-4">
          <img
            src={`${import.meta.env.VITE_APP_IMG}${DrugInfo?.DrugImage}`}
            className="w-24 h-24 object-cover rounded-lg"
            alt="Drug Image"
          />
        </div>

       
        <div className="flex-1 flex flex-col">
          <div className="mb-4 flex justify-between items-start gap-4">
            <h3
              className="text-md font-semibold text-black line-clamp-2 leading-snug pr-4"
              title={OrderItemName}
            >
              {OrderItemName}
            </h3>
          </div>

          <div className="flex justify-between">
            <div className="flex flex-col items-center bg-gray-100 p-2 rounded-lg shadow-lg w-1/2 mr-3">
              <h4 className="text-sm font-serif text-black">จำนวนยา:</h4>
              <span className="text-3xl font-bold text-blue-600">{OrderQty}</span>
            </div>
            <div className="flex flex-col items-center bg-gray-100 p-2 rounded-lg shadow-lg w-1/2 ml-2">
              <h4 className="text-sm font-serif text-black">ช่องรับยา:</h4>
              <span className="text-3xl font-bold text-green-600">{Slot === 'M01' ? '1' : '2'}</span>
            </div>
          </div>

          {warning && (
            <div className="text-sm text-red-600 mt-2">
              <span>{warning.message}</span>
              <br />
              <span>จำนวนที่จัด: {warning.orderQty}</span>
              <br />
              <span>จำนวนคงเหลือ: {warning.inventoryRemaining}</span>
            </div>
          )}
        </div>

        {OrderStatus === 'receive' ? (
          <div className="absolute top-0 right-0 mt-2 mr-2 flex flex-col items-center">
            <div className="mb-1">{getStatusIcon(OrderStatus)}</div>
            <span className="font-serif text-sm text-black">จัดเสร็จแล้ว</span>
          </div>
        ) : (
          <div className="absolute top-2 right-2 w-16 flex flex-col items-center text-center">
            <div className="mb-1">{getSmallStatusIcon(OrderStatus)}</div>
            <span className="font-serif text-xs text-black leading-tight">
              {OrderStatus === 'ready'
                ? 'รอจัดยา'
                : OrderStatus === 'pending'
                ? 'กำลังจัดยา'
                : OrderStatus === 'error'
                ? 'จัดยาไม่ครบ'
                : 'ยกเลิก'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
