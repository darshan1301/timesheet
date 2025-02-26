import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import {
  Search,
  Calendar,
  PlusCircle,
  Filter,
  ChevronDown,
  Check,
  X,
  Clock,
} from "lucide-react";
import {
  getAttendanceRequests,
  updateAttendanceRequestStatus,
} from "../services/attendanceRequest.service";
import { useAuth } from "../contexts/AuthContext";
import Modal from "../components/Modal";
import AttendanceRequestForm from "../components/AttendanceRequestForm";

const AttendanceRequests = () => {
  const { headers } = useAuth();
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: "",
    startDate: "",
    endDate: "",
    page: 1,
  });

  useEffect(() => {
    fetchRequests();
  }, [filters]);

  const fetchRequests = async () => {
    try {
      setIsLoading(true);
      const data = await getAttendanceRequests(filters);
      setRequests(data.requests);
      setPagination(data.pagination);
    } catch (error) {
      toast.error("Failed to fetch attendance requests");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (requestId, newStatus) => {
    try {
      await updateAttendanceRequestStatus(requestId, newStatus);
      toast.success(`Request ${newStatus.toLowerCase()} successfully`);
      fetchRequests(); // Refresh the data
    } catch (error) {
      toast.error(error.message || "Failed to update request");
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-500/10 border-green-500/20 text-green-500";
      case "REJECTED":
        return "bg-red-500/10 border-red-500/20 text-red-500";
      default:
        return "bg-yellow-500/10 border-yellow-500/20 text-yellow-500";
    }
  };

  return (
    <div className="p-6">
      <Modal>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h1 className="text-2xl font-bold text-white">Attendance Requests</h1>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            {/* Search Bar */}
            <div className="relative flex-grow">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300">
                <Filter className="w-5 h-5" />
              </button>
              <div className="flex">
                <input
                  type="text"
                  placeholder="Search requests..."
                  className="pl-10 pr-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg
                    text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 
                    focus:ring-blue-500/40 focus:border-transparent flex-grow"
                />
                <Modal.Open opens="create-request">
                  <button
                    className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 
                    transition-colors flex items-center gap-2 whitespace-nowrap">
                    <PlusCircle className="w-4 h-4" />
                    <span className="hidden sm:inline">New Request</span>
                  </button>
                </Modal.Open>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mb-6 p-4 bg-slate-800/50 rounded-lg border border-slate-700 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-300">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    status: e.target.value,
                    page: 1,
                  }))
                }
                className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg
                  text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40">
                <option value="">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>

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
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent"></div>
          </div>
        ) : (
          <>
            {/* Requests List */}
            {requests.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {requests.map((request) => (
                  <div
                    key={request.id}
                    className="bg-slate-800/40 backdrop-blur-sm rounded-xl border border-slate-700 p-6 flex flex-col">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-4">
                      <div>
                        <h3 className="font-semibold text-lg text-white mb-1">
                          {request.user?.username || "User"}
                        </h3>
                        <p className="text-gray-400 text-sm">
                          {request.user?.employeeId || "ID not available"}
                        </p>
                      </div>

                      <div className="self-start sm:self-center mt-1 sm:mt-0">
                        <span
                          className={`inline-block px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap
        ${
          request.status === "PENDING"
            ? "bg-yellow-500/10 text-yellow-500 border border-yellow-500/30"
            : request.status === "ACCEPT"
            ? "bg-green-500/10 text-green-500 border border-green-500/30"
            : "bg-red-500/10 text-red-500 border border-red-500/30"
        }`}>
                          {request.status}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm mb-4">
                      <div className="flex items-center gap-2 text-gray-300">
                        <Calendar className="w-4 h-4" />
                        <span>Date: {formatDate(request.date)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-300">
                        <Clock className="w-4 h-4" />
                        <span>Punch In: {formatTime(request.punchIn)}</span>
                      </div>
                      {request.punchOut && (
                        <div className="flex items-center gap-2 text-gray-300">
                          <Clock className="w-4 h-4" />
                          <span>Punch Out: {formatTime(request.punchOut)}</span>
                        </div>
                      )}
                    </div>

                    <div className="border-t border-slate-700 pt-4 mb-4">
                      <h4 className="text-sm font-medium text-gray-300 mb-2">
                        Reason:
                      </h4>
                      <p className="text-gray-400 text-sm">{request.reason}</p>
                    </div>

                    {/* Action Buttons - Only show for PENDING requests and for ADMIN/HR */}
                    {request.status === "PENDING" && (
                      <div className="mt-auto pt-4 border-t border-slate-700 flex gap-3">
                        <button
                          onClick={() =>
                            handleStatusUpdate(request.id, "ACCEPT")
                          }
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-500/10 text-green-500 
                            rounded-lg hover:bg-green-500/20 border border-green-500/30 transition-colors">
                          <Check className="w-4 h-4" />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() =>
                            handleStatusUpdate(request.id, "REJECT")
                          }
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-500/10 text-red-500 
                            rounded-lg hover:bg-red-500/20 border border-red-500/30 transition-colors">
                          <X className="w-4 h-4" />
                          <span>Reject</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 text-gray-400">
                <Calendar className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <h3 className="text-xl font-medium text-gray-300 mb-2">
                  No requests found
                </h3>
                <p>No attendance requests match your criteria.</p>
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
          </>
        )}

        {/* Create Request Modal */}
        <Modal.Window name="create-request">
          <AttendanceRequestForm onSuccess={fetchRequests} />
        </Modal.Window>
      </Modal>
    </div>
  );
};

export default AttendanceRequests;
