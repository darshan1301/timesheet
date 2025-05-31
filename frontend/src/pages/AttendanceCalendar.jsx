// src/pages/AttendanceCalendarPage.jsx

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { BsArrowLeft, BsFunnel } from "react-icons/bs";
import { getUserAttendance } from "../services/dashboard.service";
import Loader from "../components/Loader";

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function AttendanceCalendarPage() {
  // Read employeeUsername from the route
  const { employeeUsername } = useParams();
  const navigate = useNavigate();

  const today = new Date();
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [showFilters, setShowFilters] = useState(false);

  // Fetch attendance whenever employeeUsername, currentMonth, or currentYear changes
  const fetchAttendanceForEmployee = async () => {
    setLoading(true);
    try {
      // getUserAttendance expects (employeeUsername, month (1-based), year)
      const payload = await getUserAttendance(
        employeeUsername,
        currentMonth + 1,
        currentYear
      );
      // payload.attendances: [
      //   { id, punchIn: ISOString, punchOut: ISOString, date: "YYYY-MM-DD" }, ...
      // ]
      // Also payload.month and payload.year reflect the requested month/year

      setAttendanceRecords(payload.attendances || []);
      // Optionally sync state to server's month/year if payload differs
      if (payload.month !== currentMonth + 1) {
        setCurrentMonth(payload.month - 1);
      }
      if (payload.year !== currentYear) {
        setCurrentYear(payload.year);
      }
    } catch (err) {
      console.error("Error fetching user attendance:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendanceForEmployee();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employeeUsername, currentMonth, currentYear]);

  // Build a mapping dateStr -> { punchIn, punchOut, hours }
  const attendanceMap = {};
  attendanceRecords.forEach((att) => {
    const { date, punchIn, punchOut } = att;
    // Compute hours difference in decimal
    let hours = 0;
    if (punchIn && punchOut) {
      const inDate = new Date(punchIn);
      const outDate = new Date(punchOut);
      hours = (outDate - inDate) / (1000 * 60 * 60);
    }
    attendanceMap[date] = { punchIn, punchOut, hours };
  });

  // Compute days in month and starting weekday
  const firstDay = new Date(currentYear, currentMonth, 1);
  const lastDay = new Date(currentYear, currentMonth + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  const emptyCellsBefore = Array.from({ length: startingDayOfWeek });
  const dayCells = Array.from({ length: daysInMonth }, (_, idx) => {
    const day = idx + 1;
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(
      2,
      "0"
    )}-${String(day).padStart(2, "0")}`;
    const attData = attendanceMap[dateStr] || null;
    return { day, attData };
  });
  const totalCells = emptyCellsBefore.length + dayCells.length;
  const emptyCellsAfter = Array.from({ length: 42 - totalCells });

  // Compute monthly summary
  const getMonthlySummary = () => {
    let totalHours = 0;
    let presentDays = 0;
    let workingDays = 0;

    for (let day = 1; day <= daysInMonth; day++) {
      const weekday = new Date(currentYear, currentMonth, day).getDay();
      if (weekday !== 0) workingDays++;

      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(
        2,
        "0"
      )}-${String(day).padStart(2, "0")}`;
      const entry = attendanceMap[dateStr];
      if (entry) {
        totalHours += entry.hours;
        presentDays++;
      }
    }

    const averageHours = presentDays > 0 ? totalHours / presentDays : 0;
    return { totalHours, workingDays, presentDays, averageHours };
  };

  const totalSummary = getMonthlySummary();

  // Month navigation handlers
  const handlePreviousMonth = () => {
    let newMonth = currentMonth - 1;
    let newYear = currentYear;
    if (newMonth < 0) {
      newMonth = 11;
      newYear = currentYear - 1;
    }
    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
  };

  const handleNextMonth = () => {
    let newMonth = currentMonth + 1;
    let newYear = currentYear;
    if (newMonth > 11) {
      newMonth = 0;
      newYear = currentYear + 1;
    }
    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
  };

  // Format ISO string to local "HH:MM" (24h) format
  const formatTime = (isoString) => {
    if (!isoString) return "--:--";
    const dateObj = new Date(isoString);
    const hours = dateObj.getHours().toString().padStart(2, "0");
    const minutes = dateObj.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  // Generate colored attendance dots and In/Out text
  const generateAttendanceInfo = (data) => {
    const { punchIn, punchOut, hours } = data;
    let colorClass = "bg-gray-500";
    if (hours >= 8) {
      colorClass = "bg-green-500";
    } else if (hours >= 6) {
      colorClass = "bg-blue-500";
    } else if (hours >= 4) {
      colorClass = "bg-yellow-500";
    } else if (hours > 0) {
      colorClass = "bg-red-500";
    }
    return (
      <div className="flex-1 flex flex-col justify-between">
        <div className="text-xs text-green-400">In: {formatTime(punchIn)}</div>
        <div className="text-xs text-red-400">Out: {formatTime(punchOut)}</div>
        <div className="flex items-center gap-1 mt-1">
          <div className={`w-2 h-2 ${colorClass} rounded-full`} />
          <div className="text-xs text-white font-medium">
            {hours.toFixed(1)}h
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-slate-900 text-white min-h-screen p-6">
      {/* Back to employee list */}
      <div className="lg:flex gap-2 justify-between items-center">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 flex items-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors">
          <BsArrowLeft className="w-5 h-5" />
          {/* <span className="text-sm">Back to Employees</span> */}
        </button>
        <h1 className="text-2xl font-bold mb-4">
          Attendance for: {employeeUsername}
        </h1>
      </div>

      {/* Filters toggle (to show/hide month & year selectors) */}
      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={() => setShowFilters((prev) => !prev)}
          className="px-4 py-2 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors flex items-center gap-2">
          <BsFunnel className="w-4 h-4" />
          <span className="hidden sm:inline">Filters</span>
        </button>
      </div>

      {/* Month/Year selectors */}
      {showFilters && (
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-300 mb-1">
              Month
            </label>
            <select
              value={currentMonth}
              onChange={(e) => setCurrentMonth(Number(e.target.value))}
              className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40">
              {months.map((m, idx) => (
                <option key={idx} value={idx}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-300 mb-1">
              Year
            </label>
            <select
              value={currentYear}
              onChange={(e) => setCurrentYear(Number(e.target.value))}
              className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40">
              {Array.from(
                { length: 4 },
                (_, i) => today.getFullYear() - 2 + i
              ).map((yr) => (
                <option key={yr} value={yr}>
                  {yr}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Calendar Navigation with Monthly Summary */}
      <div className="mb-6 space-y-4">
        {/* Navigation */}
        <div className="flex justify-between items-center p-4 bg-slate-800/50 rounded-lg border border-slate-700">
          <button
            onClick={handlePreviousMonth}
            className="flex items-center px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors">
            <i className="fas fa-chevron-left mr-2"></i>
            Previous
          </button>

          <h2 className="text-xl font-semibold text-white">
            {months[currentMonth]} {currentYear}
          </h2>

          <button
            onClick={handleNextMonth}
            className="flex items-center px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors">
            Next
            <i className="fas fa-chevron-right ml-2"></i>
          </button>
        </div>

        {/* Monthly Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
            <div className="text-sm text-gray-400">Total Hours</div>
            <div className="text-2xl font-bold text-white">
              {totalSummary.totalHours.toFixed(1)}h
            </div>
          </div>
          <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
            <div className="text-sm text-gray-400">Working Days</div>
            <div className="text-2xl font-bold text-green-400">
              {totalSummary.workingDays}
            </div>
          </div>
          <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
            <div className="text-sm text-gray-400">Average Hours/Day</div>
            <div className="text-2xl font-bold text-blue-400">
              {totalSummary.averageHours.toFixed(1)}h
            </div>
          </div>
          <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
            <div className="text-sm text-gray-400">Present Days</div>
            <div className="text-2xl font-bold text-yellow-400">
              {totalSummary.presentDays}
            </div>
          </div>
        </div>
      </div>

      {/* Calendar */}
      {loading ? (
        <Loader />
      ) : (
        <div className="bg-slate-800/50 rounded-lg border border-slate-700 overflow-hidden">
          {/* Calendar Header */}
          <div className="grid grid-cols-7 bg-slate-800">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
              (dayName, idx) => (
                <div
                  key={idx}
                  className={`p-4 text-center text-sm font-semibold ${
                    idx === 0
                      ? "text-red-300 border-r border-slate-700"
                      : "text-gray-300 border-r border-slate-700"
                  } ${idx === 6 ? "" : ""}`}>
                  {dayName}
                </div>
              )
            )}
          </div>

          {/* Calendar Body */}
          <div id="calendarBody" className="grid grid-cols-7">
            {/* Empty cells before first day */}
            {emptyCellsBefore.map((_, idx) => (
              <div
                key={"empty-before-" + idx}
                className="p-4 border-r border-b border-slate-700 min-h-[80px]"
              />
            ))}

            {/* Each day cell */}
            {dayCells.map(({ day, attData }) => (
              <div
                key={day}
                className="p-2 border-r border-b border-slate-700 min-h-[80px] hover:bg-slate-800/50 transition-colors">
                <div className="flex flex-col h-full">
                  <div className="text-sm font-medium text-gray-300 mb-1">
                    {day}
                  </div>
                  {attData ? (
                    generateAttendanceInfo(attData)
                  ) : (
                    <div className="text-xs text-gray-500">No data</div>
                  )}
                </div>
              </div>
            ))}

            {/* Empty cells after last day */}
            {emptyCellsAfter.map((_, idx) => (
              <div
                key={"empty-after-" + idx}
                className="p-4 border-r border-b border-slate-700 min-h-[80px]"
              />
            ))}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="mt-6 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-4">Legend</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-sm text-gray-300">8+ hours</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span className="text-sm text-gray-300">6-8 hours</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500 rounded"></div>
            <span className="text-sm text-gray-300">4-6 hours</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span className="text-sm text-gray-300">Less than 4 hours</span>
          </div>
        </div>
      </div>
    </div>
  );
}
