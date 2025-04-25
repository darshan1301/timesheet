import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { Fingerprint, Clock } from "lucide-react";
import {
  checkPunchStatus,
  punchInOut,
} from "../services/punchingmachine.service";
import Loader from "./Loader";

const PunchButton = () => {
  const [isPunchedIn, setIsPunchedIn] = useState(false);
  const [lastPunchTime, setLastPunchTime] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [todayPunchIn, setTodayPunchIn] = useState(null);
  const [todayPunchOut, setTodayPunchOut] = useState(null);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    fetchPunchStatus();
  }, []);

  const fetchPunchStatus = async () => {
    setIsLoading(true);
    try {
      const data = await checkPunchStatus();
      setIsPunchedIn(data.isPunchedIn);
      setLastPunchTime(data.lastPunchTime);
      // Set today's punch times if available
      if (data.punchInTime) setTodayPunchIn(data.punchInTime);
      if (data.punchOutTime) {
        setTodayPunchOut(data.punchOutTime);
        setIsCompleted(true);
      }
    } catch (error) {
      toast.error("Failed to fetch punch status");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePunch = async () => {
    setIsLoading(true);
    const loadingToast = toast.loading(
      isPunchedIn ? "Punching out..." : "Punching in..."
    );

    try {
      const data = await punchInOut();
      setIsPunchedIn(!isPunchedIn);
      setLastPunchTime(new Date().toISOString());

      // Update punch times based on response
      if (data.punchInTime) setTodayPunchIn(data.punchInTime);
      if (data.punchOutTime) {
        setTodayPunchOut(data.punchOutTime);
        setIsCompleted(true);
      }

      toast.success(data.message, {
        id: loadingToast,
      });
    } catch (error) {
      toast.error(error.message, {
        id: loadingToast,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-6">
      <div
        className="bg-slate-800/40 backdrop-blur-lg rounded-3xl p-8 md:p-12 shadow-xl
        flex flex-col items-center max-w-xl w-full">
        {/* Current Time Display */}
        <div className="flex items-center gap-2 text-gray-400 mb-8">
          <Clock className="w-5 h-5" />
          <span className="text-xl font-medium">
            {new Date().toLocaleTimeString()}
          </span>
        </div>

        {/* Status Indicator */}
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-semibold text-white mb-2">
            Current Status
          </h2>
          <p
            className={`text-lg ${
              isCompleted
                ? "text-blue-400"
                : isPunchedIn
                ? "text-green-400"
                : "text-gray-400"
            }`}>
            {isCompleted
              ? "Today's attendance completed"
              : isPunchedIn
              ? "You are currently working"
              : "Not punched in yet"}
          </p>
        </div>

        {/* Today's Attendance Info */}
        {(todayPunchIn || todayPunchOut) && (
          <div className="w-full max-w-sm mb-8 p-4 rounded-xl bg-slate-700/30">
            <h3 className="text-white text-lg font-medium mb-3">
              {" Today's Attendance"}
            </h3>
            <div className="space-y-2">
              {todayPunchIn && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Punch In:</span>
                  <span className="text-white">
                    {new Date(todayPunchIn).toLocaleTimeString()}
                  </span>
                </div>
              )}
              {todayPunchOut && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Punch Out:</span>
                  <span className="text-white">
                    {new Date(todayPunchOut).toLocaleTimeString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Punch Button */}
        <button
          onClick={handlePunch}
          disabled={isLoading || isCompleted}
          className={`
            relative overflow-hidden group
            flex items-center justify-center gap-4
            w-48 h-48 md:w-56 md:h-56 rounded-full
            text-white font-medium text-xl
            transition-all duration-300 transform
            shadow-lg hover:shadow-2xl
            ${
              isLoading || isCompleted
                ? "cursor-not-allowed opacity-70"
                : "hover:scale-105"
            }
            ${
              isCompleted
                ? "bg-gray-500"
                : isPunchedIn
                ? "bg-red-500 hover:bg-red-600 active:bg-red-700"
                : "bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700"
            }
          `}>
          {/* Ripple effect */}
          <span
            className="absolute inset-0 w-full h-full bg-white/30 scale-0 rounded-full 
            group-active:scale-100 transition-transform duration-300"></span>

          <Fingerprint className="w-10 h-10" />
          <span className="text-2xl">
            {isCompleted ? "Completed" : isPunchedIn ? "Punch Out" : "Punch In"}
          </span>
        </button>

        {/* Last Action Time */}
        {lastPunchTime && !isCompleted && (
          <div className="mt-8 text-center">
            <p className="text-gray-400">
              Last {isPunchedIn ? "punch in" : "punch out"}
            </p>
            <p className="text-white text-lg font-medium">
              {new Date(lastPunchTime).toLocaleString()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PunchButton;
