/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import { createTask, updateTask } from "../services/task.service";
import { toast } from "react-hot-toast";

const TaskForm = ({
  onClose,
  initialData = null,
  onTaskSubmitted = () => {},
}) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    dueDate: "",
    status: "PENDING",
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || "",
        description: initialData.description || "",
        dueDate: initialData.dueDate
          ? new Date(initialData.dueDate).toISOString().split("T")[0]
          : "",
        status: initialData.status || "ONGOING",
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    setIsLoading(true);
    e.preventDefault();

    try {
      let response;
      if (initialData) {
        response = await onTaskSubmitted(initialData.id, formData);
      } else {
        response = await onTaskSubmitted(formData);
      }
      onClose();
    } catch (error) {
      toast.error(
        initialData ? "Failed to update task" : "Failed to create task"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const isEditMode = Boolean(initialData);

  return (
    <div className="min-w-[350px] z-50">
      <h2 className="text-xl font-semibold text-white mb-6">
        {isEditMode ? "Edit Task" : "Create New Task"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title Input */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Title
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg
              text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 
              focus:ring-blue-500/40 focus:border-transparent"
            placeholder="Enter task title"
          />
        </div>

        {/* Description Input */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows="3"
            className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg
              text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 
              focus:ring-blue-500/40 focus:border-transparent resize-none"
            placeholder="Enter task description"
          />
        </div>

        {/* Due Date Input */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Due Date
          </label>
          <input
            type="date"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg
              text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 
              focus:border-transparent"
          />
        </div>

        {/* Status Input (only show in edit mode) */}
        {isEditMode && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg
                text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 
                focus:border-transparent">
              <option value="ONGOING">Ongoing</option>
              <option value="COMPLETED">Completed</option>
              <option value="PENDING">Pending</option>
            </select>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-lg 
              hover:bg-slate-600 transition-colors">
            Cancel
          </button>
          <button
            disabled={isLoading}
            type="submit"
            className="flex-1 px-4 py-2 bg-emerald-500 text-white rounded-lg 
              hover:bg-emerald-600 transition-colors">
            {isEditMode ? "Update Task" : "Create Task"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TaskForm;
