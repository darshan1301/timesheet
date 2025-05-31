// src/pages/EmployeeListPage.jsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUsers } from "../services/dashboard.service";
import Loader from "../components/Loader";
import { toast } from "react-hot-toast";
import useDebounce from "../hooks/useDebounce";
export default function EmployeeListPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    pageSize: 10,
    totalItems: 0,
  });

  const [filters, setFilters] = useState({
    search: "",
    role: "",
    status: "",
    page: 1,
  });
  const debouncedValue = useDebounce(filters.search, 500);

  useEffect(() => {
    fetchUsers();
  }, [filters.page, filters.role, filters.status, debouncedValue]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const data = await getUsers(filters);
      setUsers(data.users || []);
      setPagination(data.pagination || {});
    } catch (error) {
      toast.error(error.message || "Unable to fetch users");
    } finally {
      setIsLoading(false);
    }
  };

  // Handler for typing into search input
  const handleSearchChange = (e) => {
    setFilters((prev) => ({
      ...prev,
      search: e.target.value,
      page: 1,
    }));
  };

  // Handler for changing role filter
  const handleRoleChange = (e) => {
    setFilters((prev) => ({
      ...prev,
      role: e.target.value,
      page: 1,
    }));
  };

  // Handler for changing status filter
  const handleStatusChange = (e) => {
    setFilters((prev) => ({
      ...prev,
      status: e.target.value,
      page: 1,
    }));
  };

  // Handler for clicking “Previous” page
  const goToPreviousPage = () => {
    if (pagination.currentPage > 1) {
      setFilters((prev) => ({
        ...prev,
        page: prev.page - 1,
      }));
    }
  };

  // Handler for clicking “Next” page
  const goToNextPage = () => {
    if (pagination.currentPage < pagination.totalPages) {
      setFilters((prev) => ({
        ...prev,
        page: prev.page + 1,
      }));
    }
  };

  // Navigate to attendance calendar for a given employee ID
  const handleEmployeeClick = (employeeUsername) => {
    navigate(`/attendancesheet/${employeeUsername}`);
  };

  return (
    <div className="bg-slate-900 text-white min-h-screen p-6">
      <h1 className="text-2xl font-bold mb-6">Attendance</h1>

      {/* Filters Section */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search by Username */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-300 mb-1">
            Search
          </label>
          <input
            type="text"
            placeholder="Search by username..."
            value={filters.search}
            onChange={handleSearchChange}
            className="px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
          />
        </div>

        {/* Filter by Role */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-300 mb-1">Role</label>
          <select
            value={filters.role}
            onChange={handleRoleChange}
            className="px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40">
            <option value="">All Roles</option>
            <option value="ADMIN">Admin</option>
            <option value="EMPLOYEE">Employee</option>
            <option value="MANAGER">Manager</option>
            {/* Add or adjust options based on your application’s roles */}
          </select>
        </div>

        {/* Filter by Status */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-300 mb-1">
            Status
          </label>
          <select
            value={filters.status}
            onChange={handleStatusChange}
            className="px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40">
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            {/* Add or adjust options based on your application’s statuses */}
          </select>
        </div>
      </div>

      {/* Employee Table */}
      {isLoading ? (
        <Loader />
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-slate-800 rounded-lg border border-slate-700">
            <thead>
              <tr className="bg-slate-700">
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">
                  Username
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">
                  Employee ID
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? (
                users.map((emp) => (
                  <tr
                    key={emp.id}
                    className="cursor-pointer hover:bg-slate-600/40 transition-colors"
                    onClick={() => handleEmployeeClick(emp.username)}>
                    <td className="px-6 py-4 border-b border-slate-700 text-white">
                      {emp.username}
                    </td>
                    <td className="px-6 py-4 border-b border-slate-700 text-white">
                      {emp.employeeId}
                    </td>
                    <td className="px-6 py-4 border-b border-slate-700 text-white">
                      {emp.role}
                    </td>
                    <td className="px-6 py-4 border-b border-slate-700 text-white">
                      {emp.status}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-4 text-center text-gray-400">
                    No employees found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Controls */}
      <div className="mt-6 flex items-center justify-between">
        <button
          onClick={goToPreviousPage}
          disabled={pagination.currentPage <= 1}
          className={`px-4 py-2 rounded-lg ${
            pagination.currentPage <= 1
              ? "bg-slate-700 text-gray-500 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700"
          } transition-colors`}>
          Previous
        </button>

        <div className="text-sm text-gray-300">
          Page {pagination.currentPage} of {pagination.totalPages || 1}
        </div>

        <button
          onClick={goToNextPage}
          disabled={pagination.currentPage >= pagination.totalPages}
          className={`px-4 py-2 rounded-lg ${
            pagination.currentPage >= pagination.totalPages
              ? "bg-slate-700 text-gray-500 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700"
          } transition-colors`}>
          Next
        </button>
      </div>
    </div>
  );
}
