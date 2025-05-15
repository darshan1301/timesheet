/* eslint-disable react/prop-types */
import { useState } from "react";
import {
  Clock,
  CheckCircle,
  Calendar,
  XCircle,
  Edit2,
  Trash2,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import Modal from "./Modal";

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

function TaskCard({ task, handleStatusChange }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleAccordion = () => setIsOpen(!isOpen);

  return (
    <div
      className={`rounded-xl border p-4 backdrop-blur-sm transition-all duration-300 hover:shadow-lg
      ${getStatusColor(task.status)} overflow-hidden`}>
      {/* Accordion Header */}
      <div
        className="flex justify-between items-center cursor-pointer"
        onClick={toggleAccordion}>
        <div>
          <h3 className="font-semibold text-lg text-white">{task.title}</h3>
          <span className="text-xs text-gray-400">
            {task.status.toLowerCase()}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {getStatusIcon(task.status)}
          {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </div>

      {/* Accordion Content Animated */}
      <div
        className={`transition-max-height duration-500 ease-in-out overflow-hidden
          ${isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"}`}>
        <p className="text-gray-300 my-4">{task.description}</p>

        <div className="flex flex-col gap-2 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>Assigned On: {formatDate(task.createdAt)}</span>
          </div>

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

        {/* Footer Actions */}
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
    </div>
  );
}

export default TaskCard;
