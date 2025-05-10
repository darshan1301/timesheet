// PunchButton.jsx
import { toast } from "react-hot-toast";
import { Fingerprint } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { punchInOut } from "../services/punchingmachine.service";
import Loader from "./Loader";
import useGetUser from "../hooks/useGetUser";
import { getUserLocation } from "../utils/getUserLocation";
import { useState } from "react";
import LiveClock from "./LiveClock";

const PunchButton = () => {
  const { isLoading, userinfo } = useGetUser();
  const [loader, setLoader] = useState(false);
  const queryClient = useQueryClient();

  const handlePunch = async () => {
    setLoader(true);
    const loadingToast = toast.loading(
      userinfo.isPunchedIn ? "Punching out..." : "Punching in..."
    );
    try {
      const location = await getUserLocation();
      const data = await punchInOut({
        longitude: location.longitude,
        latitude: location.latitude,
      });
      queryClient.invalidateQueries({ queryKey: ["userinfo"] });
      toast.success(data.message, { id: loadingToast });
    } catch (error) {
      toast.error(error.message, { id: loadingToast });
    } finally {
      setLoader(false);
    }
  };

  if (loader || isLoading) return <Loader />;

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-6">
      <div
        className="bg-slate-800/40 backdrop-blur-lg rounded-3xl p-8 md:p-12 shadow-xl
        flex flex-col items-center max-w-xl w-full">
        <LiveClock />

        {/* Status Indicator */}
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-semibold text-white mb-2">
            Current Status
          </h2>
          <p
            className={`text-lg ${
              userinfo.isCompleted
                ? "text-blue-400"
                : userinfo.isPunchedIn
                ? "text-green-400"
                : "text-gray-400"
            }`}>
            {userinfo.isCompleted
              ? "Today's attendance completed"
              : userinfo.isPunchedIn
              ? "You are currently working"
              : "Not punched in yet"}
          </p>
        </div>

        {/* Today's Attendance Info */}
        {(userinfo.punchInTime || userinfo.punchOutTime) && (
          <div className="w-full max-w-sm mb-8 p-4 rounded-xl bg-slate-700/30">
            <h3 className="text-white text-lg font-medium mb-3">
              {" Today's Attendance"}
            </h3>
            <div className="space-y-2">
              {userinfo.punchInTime && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Punch In:</span>
                  <span className="text-white">
                    {new Date(userinfo.punchInTime).toLocaleTimeString()}
                  </span>
                </div>
              )}
              {userinfo.punchOutTime && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Punch Out:</span>
                  <span className="text-white">
                    {new Date(userinfo.punchOutTime).toLocaleTimeString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Punch Button */}
        <button
          onClick={handlePunch}
          disabled={isLoading || userinfo.isCompleted}
          className={`
            relative overflow-hidden group
            flex items-center justify-center gap-4
            w-48 h-48 md:w-56 md:h-56 rounded-full
            text-white font-medium text-xl
            transition-all duration-300 transform
            shadow-lg hover:shadow-2xl
            ${
              isLoading || userinfo.isCompleted
                ? "cursor-not-allowed opacity-70"
                : "hover:scale-105"
            }
            ${
              userinfo.isCompleted
                ? "bg-gray-500"
                : userinfo.isPunchedIn
                ? "bg-red-500 hover:bg-red-600 active:bg-red-700"
                : "bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700"
            }
          `}>
          <span
            className="absolute inset-0 w-full h-full bg-white/30 scale-0 rounded-full 
            group-active:scale-100 transition-transform duration-300"></span>
          <Fingerprint className="w-10 h-10" />
          <span className="text-2xl">
            {userinfo.isCompleted
              ? "Completed"
              : userinfo.isPunchedIn
              ? "Punch Out"
              : "Punch In"}
          </span>
        </button>

        {/* Last Action Time */}
        {userinfo.lastPunchTime && !userinfo.isCompleted && (
          <div className="mt-8 text-center">
            <p className="text-gray-400">
              Last {userinfo.isPunchedIn ? "punch in" : "punch out"}
            </p>
            <p className="text-white text-lg font-medium">
              {new Date(userinfo.lastPunchTime).toLocaleString()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PunchButton;
