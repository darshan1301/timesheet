import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { loginUser } from "../services/user.service";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const navigate = useNavigate();
  const { setToken } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    toast.loading("Loading...");
    const res = await loginUser(formData.username, formData.password);
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.message);
      throw new Error("Login failed");
    }
    setToken(data.token);
    toast.success("Logged In.");
    return navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-slate-800 p-6">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-3">Welcome Back</h1>
          <p className="text-gray-400 text-sm">Please login to your account</p>
        </div>

        <div className="bg-slate-800/40 backdrop-blur-lg rounded-2xl p-8 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-300">
                Username
              </label>
              <input
                type="email"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full h-12 px-4 rounded-lg bg-slate-900/50 border border-slate-700/50 
                text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 
                focus:ring-blue-500/40 focus:border-transparent transition duration-200"
                placeholder="Enter your username"
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
                  className="w-full h-12 px-4 pr-12 rounded-lg bg-slate-900/50 border border-slate-700/50 
                  text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 
                  focus:ring-blue-500/40 focus:border-transparent transition duration-200"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 
                  hover:text-gray-300 focus:outline-none">
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Remember me and Forgot password */}
            <div className="flex items-center justify-end text-sm">
              {/* <label className="flex items-center text-gray-300">
                <input
                  type="checkbox"
                  className="mr-2 h-4 w-4 rounded border-gray-300 text-emerald-500 
                  focus:ring-emerald-500 focus:ring-offset-0 bg-slate-900/50"
                />
                Remember me
              </label> */}
              <a
                href="#"
                className="text-emerald-500 hover:text-emerald-400 transition-colors">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-500 text-white text-lg font-medium
              h-12 rounded-lg hover:bg-emerald-600 active:bg-emerald-700
              transition-all duration-200 shadow-lg shadow-emerald-500/20
              hover:shadow-emerald-500/30 active:shadow-emerald-500/40">
              Login
            </button>

            {/* Sign up link */}
            <p className="text-center text-gray-400 text-sm">
              {"Don't have an account?"}
              <a
                href="/signup"
                className="text-emerald-500 hover:text-emerald-400 transition-colors font-medium">
                Sign up
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
