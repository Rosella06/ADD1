import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from "../img/6.png";

function Homs() {
  const navigate = useNavigate();
  const [qrCode, setQrCode] = useState<string>("");

 
  const handleBarcodeScan = (e: React.FormEvent<HTMLInputElement>) => {
    const scannedValue = e.currentTarget.value;
    if (scannedValue) {
      setQrCode(scannedValue); 
      console.log("QR Code ที่สแกน:", scannedValue);
      navigate('/hometime'); 
    }
  };

  return (
    <div className="flex flex-col items-center justify-center text-center h-[1700px] bg-blue-100 relative">
      <img
        src={logo}
        alt="Medicine Cabinet"
        className="w-[500px] h-[650px] object-contain mb-10"
      />
      <div className="flex flex-col items-center justify-center animate-bounce">
        <span className="text-4xl font-bold text-center w-full text-[#338] px-8 py-5 bg-gradient-to-r from-white via-gray-100 to-white rounded-2xl shadow-lg -mt-[50px] inline-block">
          สแกน QR Code ใบสั่งยา 
        </span>
      </div>
``
      <input
        type="text"
        value={qrCode}
        onInput={handleBarcodeScan} 
        placeholder="กรุณาสแกน QR Code"
        className="mt-4 p-2 border rounded-xl absolute bottom-4 right-4 w-[250px] bg-transparent border-blue-100 text-transparent" // สีพื้นหลังโปร่งใสและขอบสีเดียวกับพื้นหลัง
        autoFocus 
      />
    </div>
  );
}

export default Homs;
