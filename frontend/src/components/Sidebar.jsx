/* eslint-disable react/prop-types */
import { LogOut, User } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import toast from "react-hot-toast";
import { useEffect, useRef, useState } from "react";
import useGetUser from "../hooks/useGetUser";
import { useMemo } from "react";

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

const items = [
  // these three are “staff” features — but you want Admin/HR to see them too:
  {
    label: "Punching Machine",
    path: "/",
    icon: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWZpbmdlcnByaW50Ij48cGF0aCBkPSJNMTIgMTBhMiAyIDAgMCAwLTIgMmMwIDEuMDItLjEgMi41MS0uMjYgNCIvPjxwYXRoIGQ9Ik0xNCAxMy4xMmMwIDIuMzggMCA2LjM4LTEgOC44OCIvPjxwYXRoIGQ9Ik0xNy4yOSAyMS4wMmMuMTItLjYuNDMtMi4zLjUtMy4wMiIvPjxwYXRoIGQ9Ik0yIDEyYTEwIDEwIDAgMCAxIDE4LTYiLz48cGF0aCBkPSJNMiAxNmguMDEiLz48cGF0aCBkPSJNMjEuOCAxNmMuMi0yIC4xMzEtNS4zNTQgMC02Ii8+PHBhdGggZD0iTTUgMTkuNUM1LjUgMTggNiAxNSA2IDEyYTYgNiAwIDAgMSAuMzQtMiIvPjxwYXRoIGQ9Ik04LjY1IDIyYy4yMS0uNjYuNDUtMS4zMi41Ny0yIi8+PHBhdGggZD0iTTkgNi44YTYgNiAwIDAgMSA5IDUuMnYyIi8+PC9zdmc+",
    roles: ["STAFF", "HR", "ADMIN"],
  },
  {
    label: "Task list",
    path: "/task-list",
    icon: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWxpc3QtdG9kbyI+PHJlY3QgeD0iMyIgeT0iNSIgd2lkdGg9IjYiIGhlaWdodD0iNiIgcng9IjEiLz48cGF0aCBkPSJtMyAxNyAyIDIgNC00Ii8+PHBhdGggZD0iTTEzIDZoOCIvPjxwYXRoIGQ9Ik0xMyAxMmg4Ii8+PHBhdGggZD0iTTEzIDE4aDgiLz48L3N2Zz4=",
    roles: ["STAFF", "HR", "ADMIN"],
  },
  {
    label: "Attendance Corrections",
    path: "/attendance-requests",
    icon: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLXVzZXItcGVuIj48cGF0aCBkPSJNMTEuNSAxNUg3YTQgNCAwIDAgMC00IDR2MiIvPjxwYXRoIGQ9Ik0yMS4zNzggMTYuNjI2YTEgMSAwIDAgMC0zLjAwNC0zLjAwNGwtNC4wMSA0LjAxMmEyIDIgMCAwIDAtLjUwNi44NTRsLS44MzcgMi44N2EuNS41IDAgMCAwIC42Mi42MmwyLjg3LS44MzdhMiAyIDAgMCAwIC44NTQtLjUwNnoiLz48Y2lyY2xlIGN4PSIxMCIgY3k9IjciIHI9IjQiLz48L3N2Zz4=",
    roles: ["STAFF", "HR", "ADMIN"],
  },

  // these are true admin/HR features:
  {
    label: "All Employees",
    path: "/employees",
    icon: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLXVzZXJzLXJvdW5kIj48cGF0aCBkPSJNMTggMjFhOCA4IDAgMCAwLTE2IDAiLz48Y2lyY2xlIGN4PSIxMCIgY3k9IjgiIHI9IjUiLz48cGF0aCBkPSJNMjIgMjBjMC0zLjM3LTItNi41LTQtOGE1IDUgMCAwIDAtLjQ1LTguMyIvPjwvc3ZnPg==",
    roles: ["HR", "ADMIN"],
  },
  {
    label: "Attendance Sheet",
    path: "/attendance-sheet",
    icon: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLXRhYmxlLXByb3BlcnRpZXMiPjxwYXRoIGQ9Ik0xNSAzdjE4Ii8+PHJlY3Qgd2lkdGg9IjE4IiBoZWlnaHQ9IjE4IiB4PSIzIiB5PSIzIiByeD0iMiIvPjxwYXRoIGQ9Ik0yMSA5SDMiLz48cGF0aCBkPSJNMjEgMTVIMyIvPjwvc3ZnPg==",
    roles: ["HR", "ADMIN"],
  },
  {
    label: "Locations",
    path: "/locations",
    icon: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLW1hcC1waW5uZWQtaWNvbiBsdWNpZGUtbWFwLXBpbm5lZCI+PHBhdGggZD0iTTE4IDhjMCAzLjYxMy0zLjg2OSA3LjQyOS01LjM5MyA4Ljc5NWExIDEgMCAwIDEtMS4yMTQgMEM5Ljg3IDE1LjQyOSA2IDExLjYxMyA2IDhhNiA2IDAgMCAxIDEyIDAiLz48Y2lyY2xlIGN4PSIxMiIgY3k9IjgiIHI9IjIiLz48cGF0aCBkPSJNOC43MTQgMTRoLTMuNzFhMSAxIDAgMCAwLS45NDguNjgzbC0yLjAwNCA2QTEgMSAwIDAgMCAzIDIyaDE4YTEgMSAwIDAgMCAuOTQ4LTEuMzE2bC0yLTZhMSAxIDAgMCAwLS45NDktLjY4NGgtMy43MTIiLz48L3N2Zz4=",
    roles: ["HR", "ADMIN"],
  },
];

// eslint-disable-next-line react/prop-types
const Sidebar = ({ isOpenSidebar, setIsOpenSidebar }) => {
  const { clearToken } = useAuth();
  const { userinfo, isLoading } = useGetUser();
  const navigate = useNavigate();
  const location = useLocation();
  const locationPathRef = useRef(location.pathname);

  const role = userinfo?.user?.role;
  const menuItems = useMemo(
    () => items.filter((item) => item.roles.includes(role)),
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
          <ElapsedTime start={userinfo.punchInTime} />
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

function ElapsedTime({ start }) {
  const [elapsed, setElapsed] = useState(Date.now() - new Date(start));

  useEffect(() => {
    const iv = setInterval(() => {
      setElapsed(Date.now() - new Date(start));
    }, 1000);
    return () => clearInterval(iv);
  }, [start]);

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
      You’ve been punched in for {hrs}h {mins}m {secs}s
    </p>
  );
}

export default Sidebar;
