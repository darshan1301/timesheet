/* eslint-disable react/prop-types */
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { useState } from "react";

const Layout = ({ children }) => {
  const [isOpenSidebar, setIsOpenSidebar] = useState(false);
  return (
    <div className="h-screen grid grid-rows-[auto_1fr] bg-slate-900">
      <Navbar setIsOpenSidebar={setIsOpenSidebar} />
      <div className="grid grid-cols-8">
        <Sidebar
          isOpenSidebar={isOpenSidebar}
          setIsOpenSidebar={setIsOpenSidebar}
        />
        <main
          className={`
          bg-gray-800 mx-1 xl:mx-2 p-2 text-white h-full 
          xl:col-span-6 col-span-8 overflow-y-auto hide-scrollbars infinite-scroll-container
          ${isOpenSidebar ? "hidden lg:block" : "block"}
        `}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
