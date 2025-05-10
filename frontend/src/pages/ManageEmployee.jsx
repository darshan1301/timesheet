import { useLocation } from "react-router-dom";

import { useState, useEffect } from "react";
import { User, X, Save, ArrowLeft } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import Loader from "../components/Loader";
import { getAllLocations } from "../services/location.service";
import { updateUser } from "../services/user.service";
import toast from "react-hot-toast";

const ManageEmployee = () => {
  const location = useLocation();

  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [locations, setLocations] = useState([]);
  const [formError, setFormError] = useState("");

  const [employeeData, setEmployeeData] = useState(
    location.state?.employeeData
  );

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const locationsData = await getAllLocations();

        setLocations(locationsData);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        toast.error("Failed to load employee data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEmployeeData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    try {
      setIsLoading(true);
      await updateUser(employeeData);
      toast.success("Employee updated successfully!");
    } catch (error) {
      console.error("Failed to update employee:", error);
      setFormError("Failed to update employee. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !employeeData.id) {
    return <Loader />;
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto bg-slate-800/40 backdrop-blur-sm rounded-xl border border-slate-700 p-6">
        {/* Header with back button */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <User className="w-6 h-6" />
            Edit Employee
          </h1>
        </div>

        {/* Error message */}
        {formError && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg flex items-center gap-2 text-red-400">
            <X className="w-5 h-5" />
            {formError}
          </div>
        )}

        <div onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Username */}
            <div className="flex flex-col gap-2">
              <label htmlFor="username" className="text-gray-300 font-medium">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                value={employeeData.username}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg
                text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 
                focus:ring-blue-500/40 focus:border-transparent"
              />
            </div>

            {/* Employee ID */}
            <div className="flex flex-col gap-2">
              <label htmlFor="employeeId" className="text-gray-300 font-medium">
                Employee ID
              </label>
              <input
                id="employeeId"
                name="employeeId"
                type="text"
                value={employeeData.employeeId}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg
                text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 
                focus:ring-blue-500/40 focus:border-transparent"
              />
            </div>

            {/* Role */}
            <div className="flex flex-col gap-2">
              <label htmlFor="role" className="text-gray-300 font-medium">
                Role
              </label>
              <select
                id="role"
                name="role"
                value={employeeData.role}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg
                text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40">
                <option value="ADMIN">Admin</option>
                <option value="HR">HR</option>
                <option value="STAFF">Staff</option>
              </select>
            </div>

            {/* Location */}
            <div className="flex flex-col gap-2">
              <label htmlFor="locationId" className="text-gray-300 font-medium">
                Location
              </label>
              <select
                id="locationId"
                name="locationId"
                value={parseInt(employeeData.locationId) || ""} // Use ID (not name) for value
                onChange={handleChange}
                className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg
      text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40">
                <option value="">No Location Assigned</option>
                {locations.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div className="flex flex-col gap-2">
              <label htmlFor="status" className="text-gray-300 font-medium">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={employeeData.status}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg
                text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40">
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="SUSPENDED">Suspended</option>
              </select>
            </div>

            {/* Date of Joining */}
            <div className="flex flex-col gap-2">
              <label
                htmlFor="dateOfJoining"
                className="text-gray-300 font-medium">
                Date of Joining
              </label>
              <input
                id="dateOfJoining"
                name="dateOfJoining"
                type="date"
                value={
                  new Date(employeeData.dateOfJoining)
                    .toISOString()
                    .split("T")[0]
                }
                onChange={handleChange}
                className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg
                text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-4 mt-8">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-4 py-2 border border-slate-600 text-white rounded-lg hover:bg-slate-700 
              transition-colors flex items-center gap-2">
              <X size={18} />
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading}
              className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 
              transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white"></div>
              ) : (
                <Save size={18} />
              )}
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageEmployee;
