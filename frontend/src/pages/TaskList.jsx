import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import {
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
  Search,
  PlusCircle,
} from "lucide-react";
import { getAllTasks, deleteTask, updateTask } from "../services/task.service";
import Modal from "../components/Modal";
import TaskForm from "../components/TaskForm.jsx";
import Loader from "../components/Loader.jsx";

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: "",
    dueDate: "",
    search: "",
  });

  useEffect(() => {
    fetchTasks();
  }, [filters]);

  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      // In a real application, you'd pass filters to your API
      const data = await getAllTasks();

      // Apply filters client-side (typically this would be done server-side)
      let filteredData = [...data];

      // Filter by search term
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        filteredData = filteredData.filter(
          (task) =>
            task.title.toLowerCase().includes(searchTerm) ||
            task.description.toLowerCase().includes(searchTerm)
        );
      }

      // Filter by status
      if (filters.status) {
        filteredData = filteredData.filter(
          (task) => task.status === filters.status
        );
      }

      // Filter by due date
      if (filters.dueDate) {
        const filterDate = new Date(filters.dueDate);
        filterDate.setHours(0, 0, 0, 0);

        filteredData = filteredData.filter((task) => {
          if (!task.dueDate) return false;
          const taskDueDate = new Date(task.dueDate);
          taskDueDate.setHours(0, 0, 0, 0);
          return taskDueDate.getTime() === filterDate.getTime();
        });
      }

      setTasks(filteredData);
    } catch (error) {
      toast.error("Failed to fetch tasks");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTaskCreated = (newTask) => {
    setTasks((prev) => [...prev, newTask]);
  };

  const handleDelete = async (taskId) => {
    try {
      await deleteTask(taskId);
      setTasks(tasks.filter((task) => task.id !== taskId));
      toast.success("Task deleted successfully");
    } catch (error) {
      toast.error("Failed to delete task");
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const updatedTask = await updateTask(taskId, { status: newStatus });
      setTasks(tasks.map((task) => (task.id === taskId ? updatedTask : task)));
      toast.success("Status updated successfully");
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleTaskUpdate = async (taskId, updatedData) => {
    try {
      const updatedTask = await updateTask(taskId, updatedData);
      setTasks(tasks.map((task) => (task.id === taskId ? updatedTask : task)));
      toast.success("Task updated successfully");
    } catch (error) {
      toast.error("Failed to update task");
    }
  };

  const clearFilters = () => {
    setFilters({
      status: "",
      dueDate: "",
      search: "",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-500/10 border-green-500/20 text-green-500";
      case "CANCELLED":
        return "bg-red-500/10 border-red-500/20 text-red-500";
      default:
        return "bg-blue-500/10 border-blue-500/20 text-blue-500";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "COMPLETED":
        return <CheckCircle className="w-5 h-5" />;
      case "CANCELLED":
        return <XCircle className="w-5 h-5" />;
      default:
        return <Clock className="w-5 h-5" />;
    }
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
          <h1 className="text-2xl font-bold text-white">Tasks</h1>

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
                  placeholder="Search tasks..."
                  value={filters.search}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, search: e.target.value }))
                  }
                  className="pl-10 pr-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg
                    text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 
                    focus:ring-blue-500/40 focus:border-transparent flex-grow"
                />
                <Modal.Open opens="create-task">
                  <button
                    className="ml-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 
                    transition-colors flex items-center gap-2 whitespace-nowrap">
                    <PlusCircle className="w-4 h-4" />
                    <span className="hidden sm:inline">New Task</span>
                  </button>
                </Modal.Open>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mb-6 p-4 bg-slate-800/50 rounded-lg border border-slate-700 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-300">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, status: e.target.value }))
                }
                className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg
                  text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40">
                <option value="">All Statuses</option>
                <option value="ONGOING">Ongoing</option>
                <option value="COMPLETED">Completed</option>
                <option value="PENDING">PENDING</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-300">
                Due Date
              </label>
              <input
                type="date"
                value={filters.dueDate}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, dueDate: e.target.value }))
                }
                className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg
                  text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              />
            </div>

            <div className="sm:col-span-2 flex justify-end">
              <button
                onClick={clearFilters}
                className="px-3 py-1 text-sm bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors">
                Clear Filters
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tasks.map((task) => (
            <div
              key={task.id}
              className={`rounded-xl border p-6 backdrop-blur-sm transition-all duration-300 hover:shadow-lg
                ${getStatusColor(task.status)}`}>
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-semibold text-lg text-white">
                  {task.title}
                </h3>
                <div className="flex items-center gap-2">
                  {getStatusIcon(task.status)}
                  <span className="text-sm capitalize">
                    {task.status.toLowerCase()}
                  </span>
                </div>
              </div>

              <p className="text-gray-300 mb-4 line-clamp-2">
                {task.description}
              </p>

              <div className="flex flex-col gap-2 text-sm text-gray-400">
                {task.dueDate && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>Due: {formatDate(task.dueDate)}</span>
                  </div>
                )}
                {task.completedAt && (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>Completed: {formatDate(task.completedAt)}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-700">
                <div className="flex gap-2">
                  <Modal.Open opens="edit-task" taskData={task}>
                    <button className="p-2 text-gray-400 hover:text-white transition-colors">
                      <Edit2 className="w-5 h-5" />
                    </button>
                  </Modal.Open>

                  <Modal.Open opens="delete-task" taskData={task}>
                    <button className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </Modal.Open>
                </div>

                <select
                  value={task.status}
                  onChange={(e) => handleStatusChange(task.id, e.target.value)}
                  className="bg-transparent border border-gray-600 rounded-lg px-3 py-1 text-sm
                  text-gray-300 focus:outline-none focus:border-gray-500">
                  <option value="ONGOING">Ongoing</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
            </div>
          ))}
        </div>

        {tasks.length === 0 && (
          <div className="text-center text-gray-400 mt-12">
            <p>No tasks found</p>
          </div>
        )}

        {/* Create Task Modal */}
        <Modal.Window name="create-task">
          <TaskForm onTaskCreated={handleTaskCreated} />
        </Modal.Window>

        {/* Edit Task Modal */}
        <Modal.Window name="edit-task">
          {(modalData, onClose) => (
            <TaskForm
              initialData={modalData}
              onClose={onClose}
              onTaskCreated={(updatedTask) => {
                handleTaskUpdate(modalData.id, updatedTask);
                onClose();
              }}
            />
          )}
        </Modal.Window>

        {/* Delete Confirmation Modal */}
        <Modal.Window name="delete-task">
          {(modalData, onClose) => (
            <div className="text-center">
              <h2 className="text-xl font-semibold text-white mb-4">
                Delete Task
              </h2>
              <p className="text-gray-300 mb-6">
                Are you sure you want to delete this task? This action cannot be
                undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-lg 
            hover:bg-slate-600 transition-colors">
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    await handleDelete(modalData.id);
                    onClose(); // Close modal after successful deletion
                  }}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg 
            hover:bg-red-600 transition-colors">
                  Delete
                </button>
              </div>
            </div>
          )}
        </Modal.Window>
      </Modal>
    </div>
  );
};

export default TaskList;
