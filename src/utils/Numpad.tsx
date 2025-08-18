// import React from "react";

// interface NumpadProps {
//   value: string;
//   onChange: (val: string) => void;
//   onClose: () => void;
// }

// const Numpad: React.FC<NumpadProps> = ({ value, onChange, onClose }) => {
//   const handleClick = (num: string) => onChange(value + num);
//   const handleBackspace = () => onChange(value.slice(0, -1));
//   const handleClear = () => onChange("");

//   return (
//     <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white p-4 rounded shadow-lg z-50 w-64 grid grid-cols-3 gap-2">
//       {["1","2","3","4","5","6","7","8","9"].map((n) => (
//         <button key={n} className="btn bg-gray-200" onClick={() => handleClick(n)}>{n}</button>
//       ))}
//       <button className="btn bg-yellow-200" onClick={handleClear}>C</button>
//       <button className="btn bg-gray-200" onClick={() => handleClick("0")}>0</button>
//       <button className="btn bg-red-300" onClick={handleBackspace}>←</button>
//       <button className="col-span-3 btn bg-green-500 text-white" onClick={onClose}>OK</button>
//     </div>
//   );
// };

// export default Numpad;
