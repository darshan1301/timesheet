/* eslint-disable react/prop-types */
import { LogOut, User } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import toast from "react-hot-toast";
import { useEffect, useRef, useState } from "react";
import useGetUser from "../hooks/useGetUser";
import { useMemo } from "react";
import { navbarItems } from "../constants.js";

export function getNameFromEmail(email) {
  if (!email || typeof email !== "string") return "";

  // Remove domain part (everything after @)
  const username = email.split("@")[0];

  // Handle dot-separated usernames (like "first.last@example.com")
  if (username.includes(".")) {
    // Split by dots and capitalize each part
    return username
      .split(".")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  }

  // Handle single name usernames
  return username.charAt(0).toUpperCase() + username.slice(1);
}

// eslint-disable-next-line react/prop-types
const Sidebar = ({ isOpenSidebar, setIsOpenSidebar }) => {
  const { clearToken } = useAuth();
  const { userinfo, isLoading } = useGetUser();
  const navigate = useNavigate();
  const location = useLocation();
  const locationPathRef = useRef(location.pathname);

  const role = userinfo?.user?.role;
  const menuItems = useMemo(
    () => navbarItems.filter((item) => item.roles.includes(role)),
    [role]
  );

  useEffect(() => {
    if (locationPathRef.current !== location.pathname) {
      if (isOpenSidebar && window.innerWidth < 1280) {
        setIsOpenSidebar(false);
      }
      // Update the ref
      locationPathRef.current = location.pathname;
    }
  }, [location.pathname, setIsOpenSidebar, isOpenSidebar]);

  function handleLogout() {
    clearToken();
    toast("Logged Out.");
    navigate("/login");
  }

  return (
    <div
      className={`${
        isOpenSidebar ? "block w-full" : "hidden"
      } bg-gray-800 xl:col-span-2 p-6 xl:p-4 h-screen text-white lg:h-full
   overflow-hidden col-span-8 xl:block`}>
      <div className="flex flex-col gap-3">
        {menuItems.map((item, index) => (
          <Link
            key={index}
            to={item.path}
            className="flex items-center gap-4 lg:mx-4 px-4 py-3 rounded-md 
            transition-all duration-200 ease-in-out
            bg-slate-900
            hover:bg-slate-700 border border-slate-700
            text-stone-300 hover:text-white font-medium text-sm">
            <img
              src={item.icon}
              alt={item.label}
              className="w-5 h-5 opacity-75 group-hover:opacity-100 [filter:brightness(0)_invert(1)]"
            />
            <span className="tracking-wide">{item.label}</span>
          </Link>
        ))}
      </div>

      {/* User info and logout section */}
      <div className="border-t h-full flex flex-col gap-3 border-slate-700 pt-4 mt-4">
        {/* User Info */}
        {!isLoading && userinfo?.punchInTime && (
          <ElapsedTime
            start={userinfo.punchInTime}
            end={userinfo.punchOutTime || null} // pass end if exists, else null
          />
        )}
        {!isLoading && (
          <div className="lg:mx-4 px-4 py-3 bg-slate-900 rounded-md">
            <div className="flex items-center gap-3">
              <div className="bg-slate-700 p-2 rounded-full">
                <User className="w-5 h-5 text-stone-300" />
              </div>
              <div>
                <div className="text-sm font-medium text-white">
                  {getNameFromEmail(userinfo?.user?.username)}
                </div>
                <div className="text-xs text-stone-400">
                  {userinfo.user.username}
                </div>
              </div>
            </div>
          </div>
        )}
        <div
          onClick={handleLogout}
          className="flex items-center gap-4 lg:mx-4 px-4 py-3 rounded-md 
          transition-all duration-200 ease-in-out
          bg-slate-900
          hover:bg-slate-700 border border-slate-700
          text-stone-300 hover:text-white font-medium text-sm cursor-pointer">
          <LogOut className="w-5 h-5 opacity-75 group-hover:opacity-100" />
          <span className="tracking-wide text-red-500">Logout</span>
        </div>
      </div>
    </div>
  );
};

function ElapsedTime({ start, end }) {
  const calculateElapsed = () => {
    const endTime = end ? new Date(end) : Date.now();
    return endTime - new Date(start);
  };

  const [elapsed, setElapsed] = useState(calculateElapsed());

  useEffect(() => {
    if (end) {
      setElapsed(calculateElapsed());
      return; // no interval needed
    }

    const iv = setInterval(() => {
      setElapsed(calculateElapsed());
    }, 1000);

    return () => clearInterval(iv);
  }, [start, end]);

  const totalSec = Math.floor(elapsed / 1000);
  const hrs = Math.floor(totalSec / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const secs = totalSec % 60;

  return (
    <p
      className="flex items-center lg:mx-4 px-4 py-3 rounded-md 
            transition-all duration-200 ease-in-out
            bg-slate-900
            text-green-600 font-medium text-sm">
      {end ? (
        <>
          You were punched in for {hrs}h {mins}m {secs}s
        </>
      ) : (
        <>
          You’ve been punched in for {hrs}h {mins}m {secs}s
        </>
      )}
    </p>
  );
}

export default Sidebar;
