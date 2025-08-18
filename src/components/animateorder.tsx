
// import React from "react"
// import { orderType } from "../types/orderType"
// import { CompleteOrder, PendingOrder, ScanBarcode } from "../assets/svg"
// import { TopOfWaiting } from "../styles/styles"
// type AniteType = {
//   aniteData: orderType[]
// }

// export default function Animateorder(anite: AniteType) {
//   return (
//     <TopOfWaiting $primary={anite.aniteData.length > 0}>
//       {
//         anite.aniteData.length > 0 ?
//           anite.aniteData.some(item => item.OrderStatus === '1') ? (
//             <React.Fragment>
//               <PendingOrder />
//               <span>กำลังจัดคิว</span>
//             </React.Fragment>
//           ) : (
//             anite.aniteData.some(item => item.OrderStatus === '2') ? (
//               <React.Fragment>
//                 <CompleteOrder />
//                 <span>จัดเสร็จแล้ว</span>
//               </React.Fragment>
//             ) : (
//               <React.Fragment>
//                 <ScanBarcode />
//                 <span>กรุณาสแกน QR ที่ใบยาเพื่อจัดยา</span>
//               </React.Fragment>
//             )
//           )
//           :
//           <></>
//       }
//     </TopOfWaiting>
//   )
// }
