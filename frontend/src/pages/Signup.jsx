import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { registerUser } from "../services/user.service";

const SignupPage = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordMatch, setPasswordMatch] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    signupSecret: "",
    employeeId: "",
    dateOfJoining: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "password" || name === "confirmPassword") {
      const otherField = name === "password" ? "confirmPassword" : "password";
      setPasswordMatch(
        value === formData[otherField] ||
          value === "" ||
          formData[otherField] === ""
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setPasswordMatch(false);
      return;
    }

    // Check for empty fields
    const requiredFields = [
      "username",
      "password",
      "employeeId",
      "dateOfJoining",
      "signupSecret",
    ];
    const emptyFields = requiredFields.filter((field) => !formData[field]);

    if (emptyFields.length > 0) {
      toast.error(`Please fill all required fields`);
      return;
    }

    setIsLoading(true);

    try {
      // Prepare data by removing confirmPassword
      const { confirmPassword, ...registrationData } = formData;

      // Send registration request
      const response = await registerUser(registrationData);

      // Show success message
      toast.success("Registration successful!");

      // Redirect to login page
      navigate("/login");
    } catch (error) {
      // Handle error message
      toast.error(error.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-slate-800 p-6">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-3">Create Account</h1>
          <p className="text-gray-400 text-sm">
            Enter your information to get started
          </p>
        </div>

        <div className="bg-slate-800/40 backdrop-blur-lg rounded-2xl p-8 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-300">
                Username
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                disabled={isLoading}
                className="w-full h-12 px-4 rounded-lg bg-slate-900/50 border border-slate-700/50 
                text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 
                focus:ring-blue-500/40 focus:border-transparent transition duration-200
                disabled:opacity-60 disabled:cursor-not-allowed"
                placeholder="johndoe"
              />
            </div>

            {/* Employee ID */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-300">
                Employee ID
              </label>
              <input
                type="text"
                name="employeeId"
                value={formData.employeeId}
                onChange={handleChange}
                disabled={isLoading}
                className="w-full h-12 px-4 rounded-lg bg-slate-900/50 border border-slate-700/50 
                text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 
                focus:ring-blue-500/40 focus:border-transparent transition duration-200
                disabled:opacity-60 disabled:cursor-not-allowed"
                placeholder="EMP123"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-300">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="w-full h-12 px-4 pr-12 rounded-lg bg-slate-900/50 border border-slate-700/50 
                  text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 
                  focus:ring-blue-500/40 focus:border-transparent transition duration-200
                  disabled:opacity-60 disabled:cursor-not-allowed"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 
                  hover:text-gray-300 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed">
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-300">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={isLoading}
                  className={`w-full h-12 px-4 pr-12 rounded-lg bg-slate-900/50 border border-slate-700/50 
                  text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 
                  focus:ring-blue-500/40 focus:border-transparent transition duration-200
                  disabled:opacity-60 disabled:cursor-not-allowed
                  ${
                    !passwordMatch
                      ? "border-red-500/50 focus:ring-red-500/40"
                      : ""
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isLoading}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 
                  hover:text-gray-300 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed">
                  {showConfirmPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>
              {!passwordMatch && (
                <p className="text-sm text-red-400">Passwords do not match</p>
              )}
            </div>

            {/* Date of Joining */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-300">
                Date of Joining
              </label>
              <input
                type="date"
                name="dateOfJoining"
                value={formData.dateOfJoining}
                onChange={handleChange}
                disabled={isLoading}
                className="w-full h-12 px-4 rounded-lg bg-slate-900/50 border border-slate-700/50 
                text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 
                focus:border-transparent transition duration-200
                disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>

            {/* Signup Secret */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-300">
                Signup Secret
              </label>
              <input
                type="password"
                name="signupSecret"
                value={formData.signupSecret}
                onChange={handleChange}
                disabled={isLoading}
                className="w-full h-12 px-4 rounded-lg bg-slate-900/50 border border-slate-700/50 
                text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 
                focus:ring-blue-500/40 focus:border-transparent transition duration-200
                disabled:opacity-60 disabled:cursor-not-allowed"
                placeholder="Enter the secret code"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-emerald-500 text-white text-lg font-medium
              h-12 rounded-lg hover:bg-emerald-600 active:bg-emerald-700
              transition-all duration-200 shadow-lg shadow-emerald-500/20
              hover:shadow-emerald-500/30 active:shadow-emerald-500/40
              disabled:opacity-60 disabled:cursor-not-allowed">
              {isLoading ? "Creating Account..." : "Create Account"}
            </button>

            {/* Login link */}
            <p className="text-center text-gray-400 text-sm mt-6">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-emerald-500 hover:text-emerald-400 transition-colors font-medium">
                Login
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
