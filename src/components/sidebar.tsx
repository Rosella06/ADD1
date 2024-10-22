// src/layouts/SidebarLayout.tsx
import { useContext } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { IoHomeOutline, IoSettingsOutline } from 'react-icons/io5'; // เพิ่มไอคอน Settings
import { BiCapsule, BiListPlus } from 'react-icons/bi';
import { IoIosPersonAdd, IoMdLogOut } from 'react-icons/io';
import { Link } from 'react-router-dom';
import cookies from 'js-cookie';
import Swal from 'sweetalert2';
import { Usercontext } from '../constants/constants';
import { contextType } from '../types/global.type';
import userIcon from '../img/1.png';

// import { Users } from '../types/user.type';


function SidebarLayout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { userData } = useContext(Usercontext) as contextType;

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
    // <div className="flex flex-col h-[1920px]" >
    //   {userData.userRole == "ADMIN" && (
    //     <header
    //       className="w-full bg-blue-900 text-white fixed top-0 left-0 z-10">
    //       <div className="flex items-center justify-between px-8 py-2">
    //         <span className="text-4xl font-bold text-white">
    //           ADD
    //         </span>

    //         <div className="flex items-center space-x-4">
    //           <img
    //             src={userData.userImage ? `${import.meta.env.VITE_APP_IMG}${userData.userImage}` : userIcon}
    //             alt="User"
    //             className="w-12 h-12 rounded-full border-4 border-teal-300"
    //           />
    //           <div className="flex flex-col justify-end items-center">
    //             <span className="block text-xl font-semibold mt-2">{userData.displayName}</span> {/* เพิ่ม mt-2 */}
    //             <div className="flex items-center space-x-4">
    //               <span className="block text-md">{userData.userRole}</span>
    //               <span>/</span>
    //               <button
    //                 onClick={handleLogout}
    //                 className="flex items-center space-x-2 p-2 text-red-500 hover:bg-blue-800 transition-colors duration-300"
    //               >
    //                 <IoMdLogOut className="text-md" />
    //                 <span className="text-md">Logout</span>
    //               </button>
    //             </div>
    //           </div>
    //         </div>
    //       </div>

    //       <nav >
    //         <ul className="flex justify-center space-x-6 ">
    //           <li>
    //             <Link
    //               to="/"
    //               className={`flex flex-col items-center space-y-2 p-2 transition-colors duration-300 ${pathname === "/" ? "bg-blue-800 text-yellow-400" : "hover:bg-blue-700"
    //                 }`}
    //             >
    //               <IoHomeOutline className="text-4xl" />
    //               <span>Home</span>
    //             </Link>
    //           </li>

    //           <li>
    //             <Link
    //               to="/drugs"
    //               className={`flex flex-col items-center space-y-2 p-2 transition-colors duration-300 ${pathname === "/drugs" ? "bg-blue-800 text-yellow-400" : "hover:bg-blue-700"
    //                 }`}
    //             >
    //               <BiCapsule className="text-4xl" />
    //               <span>Drugs</span>
    //             </Link>
    //           </li>

    //           <li>
    //             <Link
    //               to="/inventory"
    //               className={`flex flex-col items-center space-y-2 p-2 transition-colors duration-300 ${pathname === "/inventory" ? "bg-blue-800 text-yellow-400" : "hover:bg-blue-700"
    //                 }`}
    //             >
    //               <BiListPlus className="text-4xl" />
    //               <span>Inventory</span>
    //             </Link>
    //           </li>

    //           <li>
    //             <Link
    //               to="/adduser"
    //               className={`flex flex-col items-center space-y-2 p-2 transition-colors duration-300 ${pathname === "/adduser" ? "bg-blue-800 text-yellow-400" : "hover:bg-blue-700"
    //                 }`}
    //             >
    //               <IoIosPersonAdd className="text-4xl" />
    //               <span>User</span>
    //             </Link>
    //           </li>

    //           <li>
    //             <Link
    //               to="/settings"
    //               className={`flex flex-col items-center space-y-2 p-2 transition-colors duration-300 ${pathname === "/settings" ? "bg-blue-800 text-yellow-400" : "hover:bg-blue-700"
    //                 }`}
    //             >
    //               <IoSettingsOutline className="text-4xl" />
    //               <span>Settings</span>
    //             </Link>
    //           </li>
    //         </ul>
    //       </nav>

    //     </header>
    //   )}

    //   <main className="flex-grow pt-[176px] overflow-hidden" >
    //     <Outlet />
    //   </main>


    // </div>

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
        className={`flex flex-col items-center space-y-2 p-3 transition-colors duration-300 ${
          pathname === "/" ? "text-yellow-400" : ""
        }`}
      >
        <IoHomeOutline className="text-8xl" />
        <span className="text-2xl">Home</span>
      </Link>
    </li>

    <li>
      <Link
        to="/drugs"
        className={`flex flex-col items-center space-y-2 p-3 transition-colors duration-300 ${
          pathname === "/drugs" ? "text-yellow-400" : ""
        }`}
      >
        <BiCapsule className="text-8xl" />
        <span className="text-2xl">Drugs</span>
      </Link>
    </li>

    <li>
      <Link
        to="/inventory"
        className={`flex flex-col items-center space-y-2 p-3 transition-colors duration-300 ${
          pathname === "/inventory" ? "text-yellow-400" : ""
        }`}
      >
        <BiListPlus className="text-8xl" />
        <span className="text-2xl">Inventory</span>
      </Link>
    </li>

    <li>
      <Link
        to="/adduser"
        className={`flex flex-col items-center space-y-2 p-3 transition-colors duration-300 ${
          pathname === "/adduser" ? "text-yellow-400" : ""
        }`}
      >
        <IoIosPersonAdd className="text-8xl" />
        <span className="text-2xl">User</span>
      </Link>
    </li>

    <li>
      <Link
        to="/settings"
        className={`flex flex-col items-center space-y-2 p-3 transition-colors duration-300 ${
          pathname === "/settings" ? "text-yellow-400" : ""
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
