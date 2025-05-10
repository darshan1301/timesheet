// EmployeeTasks.jsx
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { getEmployeeTasks } from "../services/dashboard.service";
import { ArrowLeft, Clock, CheckCircle, XCircle } from "lucide-react";
import { getNameFromEmail } from "../components/Sidebar";
import Loader from "../components/Loader";

const EmployeeTasks = () => {
  const { employeeId } = useParams();
  const [tasks, setTasks] = useState([]);
  const [employee, setEmployee] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const tasksData = await getEmployeeTasks(employeeId);
        setTasks(tasksData.tasks);
        setEmployee(tasksData.employee);
      } catch (error) {
        toast.error("Failed to fetch employee tasks");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [employeeId]);

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Link to="/employees" className="text-gray-400 hover:text-white">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-white">
          Tasks for {getNameFromEmail(employee?.username) || "Employee"}
        </h1>
      </div>

      {tasks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tasks.map((task) => (
            <div
              key={task.id}
              className={`rounded-xl border p-6 backdrop-blur-sm ${
                task.status === "COMPLETED"
                  ? "bg-green-500/10 border-green-500/20"
                  : task.status === "PENDING"
                  ? "bg-red-500/10 border-red-500/20"
                  : "bg-blue-500/10 border-blue-500/20"
              }`}>
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-semibold text-lg text-white">
                  {task.title}
                </h3>
                <div className="flex items-center gap-2">
                  {task.status === "COMPLETED" ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : task.status === "PENDING" ? (
                    <XCircle className="w-5 h-5 text-red-500" />
                  ) : (
                    <Clock className="w-5 h-5 text-blue-500" />
                  )}
                  <span className="text-sm capitalize">
                    {task.status.toLowerCase()}
                  </span>
                </div>
              </div>

              <p className="text-gray-300 mb-4 line-clamp-2">
                {task.description}
              </p>

              {task.dueDate && (
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Clock className="w-4 h-4" />
                  <span>
                    Due: {new Date(task.dueDate).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-gray-400">
          <p>No tasks found for this employee</p>
        </div>
      )}
    </div>
  );
};

export default EmployeeTasks;
