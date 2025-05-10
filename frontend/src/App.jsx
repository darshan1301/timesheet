import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AttendanceRequests from "./pages/AttendanceRequests";
import Layout from "./components/Layout";
import TaskList from "./pages/TaskList";
import Employees from "./pages/Employees";
import { PublicRoute, ProtectedRoute } from "./auth/ProtectedRoutes";
import EmployeeTasks from "./pages/EmployeeTasks";
import AttendanceSheet from "./pages/AttendanceSheet";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import ManageEmployee from "./pages/ManageEmployee";
import Locations from "./pages/Locations";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, //seconds
    },
  },
});

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools initialIsOpen={false} />
      <Toaster
        position="top-center"
        toastOptions={{
          // Default options for all toasts
          duration: 2000,
          style: {
            background: "#363636",
            color: "#fff",
          },
          // Success toast options
          success: {
            duration: 3000,
            style: {
              background: "#1f2937",
              color: "#4aed88",
            },
          },
          // Error toast options
          error: {
            duration: 4000,
            style: {
              background: "#1f2937",
              color: "white",
            },
          },
        }}
      />
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <PublicRoute>
                <Signup />
              </PublicRoute>
            }
          />

          {/* Protected Routes with Layout */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
            <Route index element={<Home />} />
            <Route
              path="/attendance-requests"
              element={<AttendanceRequests />}
            />
            <Route
              path="/employee-tasks/:employeeId"
              element={<EmployeeTasks />}
            />
            <Route
              path="/manage-employee/:employeeId"
              element={<ManageEmployee />}
            />
            <Route path="/task-list" element={<TaskList />} />
            <Route path="/employees" element={<Employees />} />
            <Route path="/attendance-sheet" element={<AttendanceSheet />} />
            <Route path="/locations" element={<Locations />} />

            {/* 404 page for unknown routes under protected layout */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>

          {/* Catch all other routes and redirect to login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
};

export default App;
