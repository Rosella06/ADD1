import { cookies, decryptData, Usercontext } from "../constants/constants";
import { UserLogin } from "../types/user.type";
import CryptoJS from "crypto-js";
import Sidebar from "../components/sidebar"; // Import Sidebar

// import { Outlet } from "react-router-dom";

function Wrapper() {
  const storedCookie = cookies.get('userData');
  const userData: UserLogin = JSON.parse(decryptData(storedCookie).toString(CryptoJS.enc.Utf8));


  // console.log(userData)

  return (
    <Usercontext.Provider value={{ userData }}>

      <Sidebar />

      {/* <Outlet /> */}
    </Usercontext.Provider>
  );
}

export default Wrapper;
