import logo from "../../img/6.png";
import { orderType } from "../../types/orderType";
import Queuecard from "./queuecard";
import { IoMdLogOut } from 'react-icons/io';
import cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { contextType } from "../../types/global.type";
import { useContext } from "react";
import { Usercontext } from "../../constants/constants";
import defaultImage from '../../img/user.png';

type queuelistType = {
  queueData: orderType[];
  clearOrders: () => void;
};

export default function Queuedetails({ queueData, clearOrders }: queuelistType) {
  const { userData } = useContext(Usercontext) as contextType;
  const { userRole } = userData;
  const navigate = useNavigate();

  const handleLogout = () => {
    cookies.remove('userData');
    navigate('/login');
    Swal.fire({
      icon: 'success',
      title: 'Logged out',
      text: 'You have been logged out successfully.',
    });
  };

  return (
    <div className="bg-gradient-to-b w-full h-[1700px] bg-blue-100 flex flex-col ">
      {userRole !== 'ADMIN' && (
        <header className="bg-blue-900 w-full py-14 px-9 fixed top-0 left-0 z-10 flex justify-between items-center">
          <div className="flex items-center space-x-4">
          <div className="flex justify-center items-center">
            {userData.userImage ? (
                <img
                    src={`${import.meta.env.VITE_APP_IMG}${userData.userImage}`}
                    alt="User Profile"
                    className="rounded-full h-28 w-28"
                />
            ) : (
                <img
                    src={defaultImage} 
                    alt="Default User"
                    className="rounded-full h-28 w-28"
                />
            )}
        </div>
            <span className="text-white text-4xl font-semibold">{userData.displayName}</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 px-4 py-2 text-red-500 hover:bg-red-300 rounded-lg"
          >
            <IoMdLogOut className="text-5xl" />
            <span className="text-2xl">Logout</span>
          </button>
        </header>
      )}

      <main className="flex-grow h-screen ">
        {queueData.length > 0 ? (
          <>
            <span className="flex justify-center text-8xl font-extrabold text-yellow-400 py-12 bg-gradient-to-r from-blue-900 to-blue-700 text-transparent bg-clip-text">
              รายการยา
            </span>

            <div className="p-10 max-h-[calc(100vh-5px)] overflow-y-auto flex-grow">
              <div className="flex flex-wrap -mx-4">
                {queueData.map((items, index) => (
                  <Queuecard queueData={items} key={index} />
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <img
              src={logo}
              alt="Medicine Cabinet"
              className="w-[500px] h-[650px] object-contain mb-10"
            />
            <div className="flex flex-col items-center justify-center animate-bounce">
              <span className="text-4xl font-bold text-center w-full text-[#338] px-8 py-5 bg-gradient-to-r from-white via-gray-100 to-white rounded-2xl shadow-lg -mt-[50px] inline-block">
                สแกน Qr code ใบสั่งยา
              </span>
            </div>

          </div>
        )}
      </main>
      <div className="flex justify-end p-20">
        <button
          onClick={clearOrders}
          className="px-4 py-2 bg-red-600 text-white rounded-lg"
        >
          ล้างรายการทั้งหมด
        </button>
      </div>
    </div>
  );
}
