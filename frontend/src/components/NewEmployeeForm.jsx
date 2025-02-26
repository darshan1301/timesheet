import { useState } from "react";
import { toast } from "react-hot-toast";
import { Eye, EyeOff, User, BriefcaseBusiness, Calendar } from "lucide-react";
import { createEmployee } from "../services/dashboard.service";
import { useAuth } from "../contexts/AuthContext";

const NewEmployeeForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    employeeId: "",
    dateOfJoining: "",
    role: "STAFF",
    status: "ACTIVE",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (
      !formData.username ||
      !formData.password ||
      !formData.employeeId ||
      !formData.dateOfJoining
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    setIsLoading(true);
    try {
      await createEmployee(formData);
      toast.success("Employee created successfully");
      // Redirect or reset form
      setFormData({
        username: "",
        password: "",
        employeeId: "",
        dateOfJoining: "",
        role: "STAFF",
        status: "ACTIVE",
      });
    } catch (error) {
      toast.error(error.message || "Failed to create employee");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6">Add New Employee</h1>

        <div className="bg-slate-800/40 backdrop-blur-lg rounded-xl p-6 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username & Employee ID - 2 column layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                  <User className="w-4 h-4" />
                  <span>Username</span>
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg
                    text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 
                    focus:ring-blue-500/40 focus:border-transparent"
                  placeholder="johndoe"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                  <BriefcaseBusiness className="w-4 h-4" />
                  <span>Employee ID</span>
                </label>
                <input
                  type="text"
                  name="employeeId"
                  value={formData.employeeId}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg
                    text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 
                    focus:ring-blue-500/40 focus:border-transparent"
                  placeholder="EMP123"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                <span>Password</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-2 pr-10 bg-slate-900/50 border border-slate-700 rounded-lg
                    text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 
                    focus:ring-blue-500/40 focus:border-transparent"
                  placeholder="••••••••"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 
                  hover:text-gray-300 focus:outline-none"
                  disabled={isLoading}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Date of Joining */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                <Calendar className="w-4 h-4" />
                <span>Date of Joining</span>
              </label>
              <input
                type="date"
                name="dateOfJoining"
                value={formData.dateOfJoining}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg
                  text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 
                  focus:border-transparent"
                required
                disabled={isLoading}
              />
            </div>

            {/* Role & Status - 2 column layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">
                  Role
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg
                    text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 
                    focus:border-transparent"
                  disabled={isLoading}>
                  <option value="STAFF">Staff</option>
                  <option value="HR">HR</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg
                    text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 
                    focus:border-transparent"
                  disabled={isLoading}>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-emerald-500 text-white font-medium py-2 px-4 rounded-lg
                  hover:bg-emerald-600 transition-colors duration-200
                  disabled:opacity-50 disabled:cursor-not-allowed">
                {isLoading ? "Creating..." : "Create Employee"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewEmployeeForm;
