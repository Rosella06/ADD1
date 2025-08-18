// src/layouts/SidebarLayout.tsx
import { useContext } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { IoSettingsOutline } from 'react-icons/io5';
import { BiArchive } from 'react-icons/bi';
import { IoIosPersonAdd, IoMdLogOut } from 'react-icons/io';
import { Link } from 'react-router-dom';
import cookies from 'js-cookie';
import Swal from 'sweetalert2';
import { Usercontext } from '../constants/constants';
import { contextType } from '../types/global.type';
import userIcon from '../img/1.png';
import { FaFileContract, FaPrescriptionBottleAlt } from 'react-icons/fa';
import { GiMedicinePills, GiVendingMachine } from "react-icons/gi";
import { HiOutlineClipboardList } from "react-icons/hi";
function SidebarLayout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { userData } = useContext(Usercontext) as contextType;
  const localtion = useLocation()

  // const canSeeDispense = true; 

  const handleLogout = () => {
    cookies.remove('userData');
    localStorage.removeItem('selectedMachineId');
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
    <div className={`flex flex-col ${localtion.pathname !== "/testtools" ? "h-[1920px]" : "h-screen"}`}>
      {
        localtion.pathname !== "/testtools" &&
        <header className="w-full bg-blue-900 text-white fixed top-0 left-0 z-10">
          <div className="w-full px-5 py-3  ">
            <span className="text-4xl font-bold ">ADD</span>
          </div>
          <div className="flex items-center justify-between px-5 py-4">
            <nav className="flex-grow flex justify-center py-1">
              <ul className="flex space-x-2">
                {/* เมนู Home */}
                <li>
                  <Link
                    to="/Home"
                    className={`flex flex-col items-center space-y-2 p-3 transition-colors duration-300 ${pathname === "/Home" ? "text-yellow-400" : ""
                      }`}
                  >
                    <FaFileContract className="text-6xl" />
                    <span className="text-2xl">Dispense</span>
                  </Link>
                </li>

                {/* เมนู Refill */}
                <li>
                  <Link
                    to="/Refill"
                    className={`flex flex-col items-center space-y-2 p-3 transition-colors duration-300 ${pathname === "/Refill" ? "text-yellow-400" : ""
                      }`}
                  >
                    <FaPrescriptionBottleAlt className="text-6xl" />
                    <span className="text-2xl">Refill</span>
                  </Link>
                </li>

                {/* เฉพาะ ADMIN เท่านั้นที่เห็นเมนูด้านล่างนี้ */}
                {userData.userRole === "ADMIN" && (
                  <>
                    <li>
                      <Link
                        to="/Drugs"
                        className={`flex flex-col items-center space-y-2 p-3 transition-colors duration-300 ${pathname === "/Drugs" ? "text-yellow-400" : ""
                          }`}
                      >
                        <GiMedicinePills className="text-6xl" />
                        <span className="text-2xl">Drugs</span>
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/inventory"
                        className={`flex flex-col items-center space-y-2 p-3 transition-colors duration-300 ${pathname === "/inventory" ? "text-yellow-400" : ""
                          }`}
                      >
                        <BiArchive className="text-6xl" />
                        <span className="text-2xl">Inventory</span>
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/Machinc"
                        className={`flex flex-col items-center space-y-2 p-3 transition-colors duration-300 ${pathname === "/Machinc" ? "text-yellow-400" : ""
                          }`}
                      >
                        <GiVendingMachine className="text-6xl" />
                        <span className="text-2xl">Machine</span>
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/adduser"
                        className={`flex flex-col items-center space-y-2 p-3 transition-colors duration-300 ${pathname === "/adduser" ? "text-yellow-400" : ""
                          }`}
                      >
                        <IoIosPersonAdd className="text-6xl" />
                        <span className="text-2xl">User</span>
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/DispensingReport"
                        className={`flex flex-col items-center space-y-2 p-3 transition-colors duration-300 ${pathname === "/DispensingReport" ? "text-yellow-400" : ""
                          }`}
                      >
                        <HiOutlineClipboardList className="text-6xl" />
                        <span className="text-2xl">Report</span>
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/settings"
                        className={`flex flex-col items-center space-y-2 p-3 transition-colors duration-300 ${pathname === "/settings" ? "text-yellow-400" : ""
                          }`}
                      >
                        <IoSettingsOutline className="text-6xl" />
                        <span className="text-2xl">Settings</span>
                      </Link>
                    </li>
                  </>
                )}
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
                className="w-16 h-16 rounded-full "
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
      }

      <main className={`${localtion.pathname !== "/testtools" ? "lex-grow pt-[224px] overflow-hidden" : "h-screen"}`}>
        <Outlet />
      </main>
    </div>



  );
}

export default SidebarLayout;
