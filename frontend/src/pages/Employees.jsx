import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { Search, Calendar, UserPlus, UserPen } from "lucide-react";
import { getUsers } from "../services/dashboard.service";
import Modal from "../components/Modal";
import NewEmployeeForm from "../components/NewEmployeeForm";
import { Link } from "react-router-dom";
import Loader from "../components/Loader";

const Employees = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({
    search: "",
    role: "",
    status: "",
    page: 1,
  });

  useEffect(() => {
    fetchUsers();
  }, [filters]);

  const fetchUsers = async () => {
    try {
      const data = await getUsers(filters);
      setUsers(data.users);
      setPagination(data.pagination);
    } catch (error) {
      toast.error("Failed to fetch employees");
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="p-6">
      <Modal>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h1 className="text-2xl font-bold text-white">Employees</h1>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search employees..."
                value={filters.search}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    search: e.target.value,
                    page: 1,
                  }))
                }
                className="w-full pl-10 pr-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg
            text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 
            focus:ring-blue-500/40 focus:border-transparent"
              />
            </div>

            <div className="flex gap-3">
              <select
                value={filters.role}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    role: e.target.value,
                    page: 1,
                  }))
                }
                className="px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg
            text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40">
                <option value="">All Roles</option>
                <option value="ADMIN">Admin</option>
                <option value="HR">HR</option>
                <option value="STAFF">Staff</option>
              </select>

              {/* Add Employee Button */}
              <Modal.Open opens="create-employee">
                <button
                  className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 
              transition-colors flex items-center gap-2 whitespace-nowrap">
                  <UserPlus size={18} />
                  <span className="hidden sm:inline">Add Employee</span>
                </button>
              </Modal.Open>
            </div>
          </div>
        </div>

        {/* Users Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((user) => {
            // Get today's attendance (first item in the array)
            const todayAttendance = user.attendances[0];

            return (
              <div
                key={user.id}
                className="bg-slate-800/40 backdrop-blur-sm rounded-xl border border-slate-700 p-6 flex flex-col">
                {/* Header: Username, EmployeeID, and Status */}
                <div className="flex items-start justify-between mb-6">
                  <Link to={`/employee-tasks/${user.id}`} key={user.id}>
                    <h3 className="font-semibold text-lg text-white mb-1">
                      {user.username}
                    </h3>
                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                      <span>ID: {user.employeeId}</span>
                      <span>•</span>
                      <span>{user.role}</span>
                    </div>
                  </Link>
                </div>

                {/* Info Section */}
                <div className="flex items-center gap-4 text-sm text-gray-400 mb-6">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>Joined {formatDate(user.dateOfJoining)}</span>
                  </div>
                </div>

                {/* Manage Employee Link */}
                <Link
                  to={`/manage-employee/${user.id}`}
                  state={{ employeeData: user }}
                  className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors mb-6">
                  <UserPen className="w-4 h-4" />
                  <span>Manage Employee</span>
                </Link>

                {/* Attendance Status */}
                <div className="mt-auto pt-4 border-t border-slate-700">
                  <div
                    className={`flex items-center justify-center gap-2 p-2 rounded-lg font-medium
      ${
        todayAttendance?.punchOut
          ? "bg-red-500/10 text-red-500"
          : todayAttendance?.punchIn
          ? "bg-green-500/10 text-green-500"
          : "bg-gray-500/10 text-gray-400"
      }`}>
                    <div
                      className={`w-2 h-2 rounded-full
        ${
          todayAttendance?.punchOut
            ? "bg-red-500"
            : todayAttendance?.punchIn
            ? "bg-green-500"
            : "bg-gray-400"
        }`}
                    />
                    {todayAttendance?.punchOut
                      ? `Punched Out at ${formatTime(todayAttendance.punchOut)}`
                      : todayAttendance?.punchIn
                      ? `Working since ${formatTime(todayAttendance.punchIn)}`
                      : "Not Punched In"}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            <button
              onClick={() =>
                setFilters((prev) => ({ ...prev, page: prev.page - 1 }))
              }
              disabled={!pagination.hasPreviousPage}
              className="px-4 py-2 bg-slate-700 text-white rounded-lg 
              disabled:opacity-50 disabled:cursor-not-allowed">
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
              className="px-4 py-2 bg-slate-700 text-white rounded-lg 
              disabled:opacity-50 disabled:cursor-not-allowed">
              Next
            </button>
          </div>
        )}
        {/* Add Employee Modal */}
        <Modal.Window name="create-employee">
          <div className="w-full max-w-2xl">
            <h2 className="text-xl font-semibold text-white mb-6">
              Add New Employee
            </h2>
            <NewEmployeeForm
              onSuccess={() => {
                fetchUsers(); // Refresh the user list after creating
              }}
            />
          </div>
        </Modal.Window>
      </Modal>
    </div>
  );
};

export default Employees;
