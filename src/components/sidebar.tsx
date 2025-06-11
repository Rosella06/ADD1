// src/layouts/SidebarLayout.tsx
import { useContext } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import {  IoSettingsOutline } from 'react-icons/io5'; 
import { BiArchive } from 'react-icons/bi';
import { IoIosPersonAdd, IoMdLogOut } from 'react-icons/io';
import { Link } from 'react-router-dom';
import cookies from 'js-cookie';
import Swal from 'sweetalert2';
import { Usercontext } from '../constants/constants';
import { contextType } from '../types/global.type';
import userIcon from '../img/1.png';
import { FaClipboardList, FaFileContract} from 'react-icons/fa';
import { GiVendingMachine } from "react-icons/gi";
// import { Users } from '../types/user.type';
import { CiPill } from "react-icons/ci";

function SidebarLayout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { userData } = useContext(Usercontext) as contextType;
 
  // const canSeeDispense = true; 

  const handleLogout = () => {
    cookies.remove('userData');
    navigate('/login');
    Swal.fire({
      icon: 'success',
      title: 'Logged out',
      text: 'You have been logged out successfully.',
    });
  };

  if (pathname === '/login') {
    return <Outlet />;
  }

  return (
    <div className="flex flex-col h-[1920px]">
      {userData.userRole === "ADMIN" && (
        <header className="w-full bg-blue-900 text-white fixed top-0 left-0 z-10">
          <div className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center space-x-4">
              <span className="text-6xl font-bold text-white">ADD</span>
            </div>

            <nav className="flex-grow flex justify-center py-4">
              <ul className="flex space-x-2">
                <li>
                  <Link
                    to="/"
                    className={`flex flex-col items-center space-y-2 p-3 transition-colors duration-300 ${pathname === "/" ? "text-yellow-400" : ""
                      }`}
                  >
                    <FaFileContract className="text-8xl" />
                    <span className="text-2xl">Dispense</span>
                  </Link>
                </li>

                <li>
                  <Link
                    to="/Refill"
                    className={`flex flex-col items-center space-y-2 p-3 transition-colors duration-300 ${pathname === "/Refill" ? "text-yellow-400" : ""
                      }`}
                  >
                    <FaClipboardList className="text-8xl" />
                    {/* CiMedicalClipboard  */}
                    <span className="text-2xl">Refill</span>
                  </Link>
                </li>

                  <li>
                  <Link
                    to="/Drugs"
                    className={`flex flex-col items-center space-y-2 p-3 transition-colors duration-300 ${pathname === "/Drugs" ? "text-yellow-400" : ""
                      }`}
                  >
                    <CiPill className="text-8xl" />
                    <span className="text-2xl">Drugs</span>
                  </Link>
                </li>
 
                <li>
                  <Link
                    to="/inventory"
                    className={`flex flex-col items-center space-y-2 p-3 transition-colors duration-300 ${pathname === "/inventory" ? "text-yellow-400" : ""
                      }`}
                  >
                    <BiArchive className="text-8xl" />
                    <span className="text-2xl">Inventory</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/Machinc"
                    className={`flex flex-col items-center space-y-2 p-3 transition-colors duration-300 ${pathname === "/Machinc" ? "text-yellow-400" : ""
                      }`}
                  >
                    <GiVendingMachine className="text-8xl" />
                    <span className="text-2xl">Machine</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/adduser"
                    className={`flex flex-col items-center space-y-2 p-3 transition-colors duration-300 ${pathname === "/adduser" ? "text-yellow-400" : ""
                      }`}
                  >
                    <IoIosPersonAdd className="text-8xl" />
                    <span className="text-2xl">User</span>
                  </Link>
                </li>

                <li>
                  <Link
                    to="/settings"
                    className={`flex flex-col items-center space-y-2 p-3 transition-colors duration-300 ${pathname === "/settings" ? "text-yellow-400" : ""
                      }`}
                  >
                    <IoSettingsOutline className="text-8xl" />
                    <span className="text-2xl">Settings</span>
                  </Link>
                </li>
              </ul>
            </nav>
            <div className="flex flex-col items-center space-y-2 ml-auto">
              <img
                src={
                  userData.userImage
                    ? `${import.meta.env.VITE_APP_IMG}${userData.userImage}`
                    : userIcon
                }
                alt="User"
                className="w-16 h-16 rounded-full border-4 border-teal-300"
              />
              <div className="flex flex-col items-center">
                <span className="block text-2xl font-semibold">
                  {userData.displayName}
                </span>
                <div className="flex items-center space-x-4">
                  <span className="block text-lg">{userData.userRole}</span>
                  <span>/</span>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 p-2 text-red-500 hover:bg-blue-800 transition-colors duration-300"
                  >
                    <IoMdLogOut className="text-lg" />
                    <span className="text-lg">Logout</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>
      )}

      <main className="lex-grow pt-[224px] overflow-hidden">
        <Outlet />
      </main>
    </div>



  );
}

export default SidebarLayout;
