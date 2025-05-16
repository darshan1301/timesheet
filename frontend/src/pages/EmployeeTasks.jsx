import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { ArrowLeft, Filter, PlusCircle } from "lucide-react";
import { updateTask } from "../services/task.service";
import { getEmployeeTasks } from "../services/dashboard.service";
import { getNameFromEmail } from "../components/Sidebar";
import Loader from "../components/Loader";
import Modal from "../components/Modal";
import TaskCard from "../components/TaskCard";
import TaskForm from "../components/TaskForm";

const EmployeeTasks = () => {
  const { employeeId } = useParams();

  const [tasks, setTasks] = useState([]);
  const [employee, setEmployee] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: "",
    dueDate: "",
    createdAt: "",
    search: "",
  });

  useEffect(() => {
    fetchTasks();
  }, [filters]);

  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      const data = await getEmployeeTasks(employeeId);
      setEmployee(data.employee);

      let filtered = [...data.tasks];

      if (filters.search) {
        filtered = filtered.filter((t) =>
          t.title.toLowerCase().includes(filters.search.toLowerCase())
        );
      }

      if (filters.status) {
        filtered = filtered.filter((t) => t.status === filters.status);
      }

      if (filters.dueDate) {
        const filterDate = new Date(filters.dueDate);
        filterDate.setHours(0, 0, 0, 0);
        filtered = filtered.filter((t) => {
          if (!t.dueDate) return false;
          const taskDue = new Date(t.dueDate);
          taskDue.setHours(0, 0, 0, 0);
          return taskDue.getTime() === filterDate.getTime();
        });
      }

      if (filters.createdAt) {
        const filterDate = new Date(filters.createdAt);
        filterDate.setHours(0, 0, 0, 0);
        filtered = filtered.filter((t) => {
          if (!t.createdAt) return false;
          const taskCreated = new Date(t.createdAt);
          taskCreated.setHours(0, 0, 0, 0);
          return taskCreated.getTime() === filterDate.getTime();
        });
      }

      setTasks(filtered);
    } catch (error) {
      toast.error("Failed to fetch tasks");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTaskCreated = (newTask) => {
    setTasks((prev) => [...prev, newTask]);
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const updated = await updateTask(taskId, { status: newStatus });
      setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
      toast.success("Status updated");
    } catch {
      toast.error("Failed to change status");
    }
  };

  const clearFilters = () => {
    setFilters({ status: "", dueDate: "", createdAt: "", search: "" });
  };

  if (isLoading) return <Loader />;

  return (
    <div className="p-6">
      <Modal>
        <div className="flex justify-between items-center align-middle gap-2 mb-6">
          <div className="flex items-center gap-2">
            <Link to="/employees" className="text-gray-400 hover:text-white">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl font-bold text-white">
              Tasks for {getNameFromEmail(employee?.username)}
            </h1>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative flex-grow">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300">
                <Filter className="w-5 h-5" />
              </button>
              <div className="flex">
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={filters.search}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, search: e.target.value }))
                  }
                  className="pl-10 pr-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder:text-gray-500 focus:outline-none flex-grow"
                />
                <Modal.Open opens="assign-task">
                  <button className="ml-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 flex items-center gap-2">
                    <PlusCircle className="w-4 h-4" /> Assign Task
                  </button>
                </Modal.Open>
              </div>
            </div>
          </div>
        </div>

        {showFilters && (
          <div className="mb-6 p-4 bg-slate-800/50 rounded-lg border border-slate-700 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-sm text-gray-300">Status</label>
              <select
                value={filters.status}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, status: e.target.value }))
                }
                className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white">
                <option value="">All</option>
                <option value="ONGOING">Ongoing</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="text-sm text-gray-300">Due Date</label>
              <input
                type="date"
                value={filters.dueDate}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, dueDate: e.target.value }))
                }
                className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white"
              />
            </div>

            <div>
              <label className="text-sm text-gray-300">Created At</label>
              <input
                type="date"
                value={filters.createdAt}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, createdAt: e.target.value }))
                }
                className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white"
              />
            </div>

            <div className="sm:col-span-3 flex justify-end">
              <button
                onClick={clearFilters}
                className="px-3 py-1 text-sm bg-gray-700 text-white rounded hover:bg-gray-600">
                Clear Filters
              </button>
            </div>
          </div>
        )}

        {tasks.length > 0 ? (
          <div className="flex flex-col gap-6">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                handleStatusChange={handleStatusChange}
              />
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-400 mt-12">
            <p>No tasks found</p>
          </div>
        )}

        <Modal.Window name="assign-task">
          <TaskForm employeeId={employeeId} onTaskCreated={handleTaskCreated} />
        </Modal.Window>
      </Modal>
    </div>
  );
};

export default EmployeeTasks;
