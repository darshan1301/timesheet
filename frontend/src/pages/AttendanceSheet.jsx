// AttendanceSheet.jsx
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import {
  Calendar,
  Download,
  Clock,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  getAttendanceSheet,
  exportAttendanceSheet,
  getUsers,
} from "../services/dashboard.service";
import { useAuth } from "../contexts/AuthContext";

const AttendanceSheet = () => {
  const { user } = useAuth();
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
    employeeId: "",
    page: 1,
  });

  useEffect(() => {
    fetchAttendanceRecords();

    // Fetch employees list for filter dropdown if admin or HR
    if (user?.role === "ADMIN" || user?.role === "HR") {
      fetchEmployees();
    }
  }, [filters]);

  const fetchAttendanceRecords = async () => {
    setIsLoading(true);
    try {
      const data = await getAttendanceSheet(filters);
      setAttendanceRecords(data.records);
      setPagination(data.pagination);
    } catch (error) {
      toast.error("Failed to fetch attendance records");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const data = await getUsers({ limit: 100 });
      setEmployees(data.users);
    } catch (error) {
      console.error("Failed to fetch employees");
    }
  };

  const handleExport = async () => {
    try {
      const blob = await exportAttendanceSheet(filters);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `attendance-${filters.startDate}-${filters.endDate}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error("Failed to export attendance records");
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const calculateWorkHours = (punchIn, punchOut) => {
    if (!punchIn || !punchOut) return "-";

    const start = new Date(punchIn);
    const end = new Date(punchOut);
    const diffMs = end - start;
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.round((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    return `${diffHrs}h ${diffMins}m`;
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-white">Attendance Sheet</h1>

        <div className="flex flex-row gap-3 w-full md:w-auto">
          {/* Filter and Export buttons */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600
              transition-colors flex items-center gap-2">
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline">Filters</span>
          </button>

          <button
            onClick={handleExport}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 
              transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="mb-6 p-4 bg-slate-800/50 rounded-lg border border-slate-700 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-300">
              Start Date
            </label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  startDate: e.target.value,
                  page: 1,
                }))
              }
              className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg
                text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-300">
              End Date
            </label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  endDate: e.target.value,
                  page: 1,
                }))
              }
              className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg
                text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            />
          </div>

          {(user?.role === "ADMIN" || user?.role === "HR") && (
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-300">
                Employee
              </label>
              <select
                value={filters.employeeId}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    employeeId: e.target.value,
                    page: 1,
                  }))
                }
                className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg
                  text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40">
                <option value="">All Employees</option>
                {employees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.username}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent"></div>
        </div>
      ) : (
        <>
          {/* Mobile-friendly attendance cards for small screens */}
          <div className="block md:hidden">
            {attendanceRecords.map((record) => (
              <div
                key={record.id}
                className="mb-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-300">
                    Date:
                  </span>
                  <span className="text-sm text-white">
                    {formatDate(record.date)}
                  </span>
                </div>

                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-300">
                    Employee:
                  </span>
                  <span className="text-sm text-white">
                    {record.user.username}
                  </span>
                </div>

                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-300">
                    Punch In:
                  </span>
                  <span className="text-sm text-green-400">
                    {formatTime(record.punchIn)}
                  </span>
                </div>

                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-300">
                    Punch Out:
                  </span>
                  <span className="text-sm text-red-400">
                    {formatTime(record.punchOut)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-300">
                    Hours:
                  </span>
                  <span className="text-sm text-white">
                    {calculateWorkHours(record.punchIn, record.punchOut)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Table for larger screens */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-800 text-left">
                  <th className="p-3 text-sm font-semibold text-gray-300">
                    Date
                  </th>
                  <th className="p-3 text-sm font-semibold text-gray-300">
                    Employee
                  </th>
                  <th className="p-3 text-sm font-semibold text-gray-300">
                    Punch In
                  </th>
                  <th className="p-3 text-sm font-semibold text-gray-300">
                    Punch Out
                  </th>
                  <th className="p-3 text-sm font-semibold text-gray-300">
                    Hours
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {attendanceRecords.map((record) => (
                  <tr
                    key={record.id}
                    className="hover:bg-slate-800/50 transition-colors">
                    <td className="p-3 text-sm text-gray-300">
                      {formatDate(record.date)}
                    </td>
                    <td className="p-3 text-sm text-white">
                      {record.user.username}
                    </td>
                    <td className="p-3 text-sm text-green-400">
                      {formatTime(record.punchIn)}
                    </td>
                    <td className="p-3 text-sm text-red-400">
                      {formatTime(record.punchOut)}
                    </td>
                    <td className="p-3 text-sm text-gray-300">
                      {calculateWorkHours(record.punchIn, record.punchOut)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {attendanceRecords.length === 0 && (
            <div className="text-center py-20 text-gray-400">
              <Calendar className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <h3 className="text-xl font-medium text-gray-300 mb-2">
                No attendance records found
              </h3>
              <p>Try adjusting your filters or date range</p>
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <button
                onClick={() =>
                  setFilters((prev) => ({ ...prev, page: prev.page - 1 }))
                }
                disabled={!pagination.hasPreviousPage}
                className="flex items-center px-4 py-2 bg-slate-700 text-white rounded-lg 
                  disabled:opacity-50 disabled:cursor-not-allowed">
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </button>
              <span className="px-4 py-2 text-white">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              <button
                onClick={() =>
                  setFilters((prev) => ({ ...prev, page: prev.page + 1 }))
                }
                disabled={!pagination.hasNextPage}
                className="flex items-center px-4 py-2 bg-slate-700 text-white rounded-lg 
                  disabled:opacity-50 disabled:cursor-not-allowed">
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AttendanceSheet;
