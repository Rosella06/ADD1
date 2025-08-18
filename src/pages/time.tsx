// import { useState, useEffect } from 'react';
// import { FaClock, FaCheck, FaPrescriptionBottle } from 'react-icons/fa';

// function Hometime() {
//   const initialOrders = [
//     {
//       OrderitemCode: 'OC-01',
//       OrderitemName: 'Sellon Shampoo 2.5%',
//       OrderQty: 2,
//       BinLocation: '01',
//       Slot: '',
//       OrderStatus: '0',
//       image: 'https://img.priceza.com/img2/7077/0764/7077-20221003125115-126219682834231914.jpg',
//       waitingTime: 1000,
//       processingTime: 15000,
//       completedTime: 16000,
//       delayForShipped: 26000,
//     },
//     {
//       OrderitemCode: 'OC-02',
//       OrderitemName: 'Gel',
//       OrderQty: 3,
//       BinLocation: '01',
//       Slot: '',
//       OrderStatus: '0',
//       image: 'https://media.discordapp.net/attachments/904031323331633152/1314416469966192730/IMG_2897.jpg?ex=6757a5bb&is=6756543b&hm=c3e99d78e002d65111fa01240d99a0a60fecd93b3a2210057c6cbaa883c96a4c&=&format=webp&width=253&height=310',
//       waitingTime: 16000,
//       processingTime: 22000,
//       completedTime: 23000,
//       delayForShipped: 38000,
//     },
//     {
//       OrderitemCode: 'OC-03',
//       OrderitemName: 'Paracap 500mg',
//       OrderQty: 5,
//       BinLocation: '02',
//       Slot: '',
//       OrderStatus: '0',
//       image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTIhwTcdM0qKw-7MblgIY8Gqm_1p5_xfeWx4w&s',
//       waitingTime: 23000,
//       processingTime: 38000,
//       completedTime: 39000,
//       delayForShipped: 48000,
//     },
//     {
//       OrderitemCode: 'OC-04',
//       OrderitemName: 'Flemex Syrup',
//       OrderQty: 2,
//       BinLocation: '02',
//       Slot: '',
//       OrderStatus: '0',
//       image: 'https://911drugstore.com/wp-content/uploads/2023/09/flemex-carbocysteine-60ml-%E0%B8%86%E0%B8%97673-2564.jpg',
//       waitingTime: 37000,
//       processingTime: 42000,
//       completedTime: 43000,
//       delayForShipped: 50000,
//     },
//   ];

//   const [orders, setOrders] = useState(initialOrders);

//   const getStatusIcon = (status: string) => {
//     switch (status) {
//       case '0':
//         return <FaClock className="text-gray-500 text-3xl" />;
//       case '1':
//         return (
//           <div className="w-8 h-8 border-4 border-t-4 border-gray-200 border-t-amber-400 rounded-full animate-spin"></div>
//         );
//       case '2':
//         return <FaPrescriptionBottle className="text-blue-500 text-3xl" />;
//       case '3':
//         return <FaCheck className="text-green-500 text-3xl" />;
//       default:
//         return null;
//     }
//   };

//   const getStatusBorderBottomColor = (status: string) => {
//     switch (status) {
//       case '0':
//         return 'border-white-500';
//       case '1':
//         return 'border-amber-400 ';
//       case '2':
//         return 'border-blue-500';
//       case '3':
//         return 'border-green-500';
//       default:
//         return 'border-red-500';
//     }
//   };

//   useEffect(() => {
//     const updateStatus = (index: number, status: string) => {
//       setOrders((prevOrders) =>
//         prevOrders.map((orderItem, i) =>
//           i === index ? { ...orderItem, OrderStatus: status } : orderItem
//         )
//       );
//     };

//     const assignSlot = (index: number) => {
//       const slotAssignments = ['1', '2', '1', '2']; // Slot assignments for each order
//       setOrders((prevOrders) => {
//         const updatedOrders = [...prevOrders];
//         if (index < slotAssignments.length) {
//           updatedOrders[index].Slot = slotAssignments[index];
//         }
//         return updatedOrders;
//       });
//     };

//     const processOrder = (index: number, delayOffset: number) => {
//       const order = initialOrders[index];
//       const timeUpdates = [
//         { time: 0 + delayOffset, status: '0' },
//         { time: order.waitingTime + delayOffset, status: '1' },
//         { time: order.waitingTime + order.processingTime + delayOffset, status: '2' },
//         { time: order.waitingTime + order.processingTime + order.completedTime + delayOffset, status: '3' },
//       ];

//       timeUpdates.forEach((update) => {
//         setTimeout(() => {
//           updateStatus(index, update.status);
//           if (update.status === '1') assignSlot(index);
//         }, update.time);
//       });
//     };

//     let delayOffset = 0;
//     for (let i = 0; i < initialOrders.length; i += 2) {
//       processOrder(i, delayOffset);
//       delayOffset += initialOrders[i].completedTime + 1000;
//     }

//     delayOffset = 5000; // Delay next batch
//     for (let i = 1; i < initialOrders.length; i += 2) {
//       processOrder(i, delayOffset);
//       delayOffset += initialOrders[i].completedTime + 1000;
//     }
//   }, []);

//   return (
//     <div className="relative w-full h-screen bg-blue-100 flex flex-col">
//       <div className="p-12">
//         <div className="flex flex-wrap -mx-4">
//           {orders.map((order, index) => (
//             <div
//               key={index}
//               className="w-full sm:w-1/2 md:w-1/2 lg:w-1/2 xl:w-1/2 px-4 mb-6"
//             >
//               <div
//                 className={`relative border-b-8 ${getStatusBorderBottomColor(order.OrderStatus)} rounded-lg shadow-md flex p-4 bg-gray-50`}
//                 style={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)' }}
//               >
//                 <div className="flex-shrink-0 mr-4">
//                   <img
//                     src={order.image}
//                     alt="Product"
//                     className="w-32 h-32 object-cover rounded-lg border border-slate-300"
//                   />
//                 </div>

//                 <div className="flex-1 flex flex-col">
//                   <div className="mb-4">
//                     <h3 className="text-xl font-semibold mb-2 text-gray-800">
//                       {order.OrderitemName}
//                     </h3>
//                   </div>

//                   <div className="flex justify-between">
//                     <div className="flex flex-col items-center bg-gray-100 p-3 rounded-lg shadow-lg w-1/2 mr-4">
//                       <h4 className="text-md font-medium text-gray-700">จำนวนยา:</h4>
//                       <span className="text-3xl font-bold text-teal-600">
//                         {order.OrderQty}
//                       </span>
//                     </div>
//                     <div className="flex flex-col items-center bg-gray-100 p-3 rounded-lg shadow-lg w-1/2 ml-2">
//                       <h4 className="text-md font-medium text-gray-700">ช่องที่ต้องรับยา:</h4>
//                       <span className="text-3xl font-bold text-lime-600">
//                         {order.Slot || '-'}
//                       </span>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="absolute top-0 right-0 mt-1.5 mr-3 flex flex-col items-center">
//                   <div className="mb-1">{getStatusIcon(order.OrderStatus)}</div>
//                   <span className="text-md font-medium text-gray-700">
//                     {order.OrderStatus === '0'
//                       ? 'รอจัดยา'
//                       : order.OrderStatus === '1'
//                       ? 'กำลังจัดยา'
//                       : order.OrderStatus === '2'
//                       ? 'จัดยาเสร็จ'
//                       : 'หยิบยา'}
//                   </span>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }

// export default Hometime;
