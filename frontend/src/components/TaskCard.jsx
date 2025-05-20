/* eslint-disable react/prop-types */
import { useState } from "react";
import {
  Clock,
  CheckCircle,
  Calendar,
  Edit2,
  Trash2,
  ChevronUp,
  ChevronDown,
  AlertCircle,
} from "lucide-react";
import Modal from "./Modal";

const getStatusColor = (status) => {
  switch (status) {
    case "COMPLETED":
      return "bg-green-500/10 border-green-500/20 text-green-500";
    case "PENDING":
      return "bg-yellow-500/10 border-yellow-500/20 text-yellow-500";
    case "ONGOING":
      return "bg-blue-500/10 border-blue-500/20 text-blue-500";
    default:
      return "bg-gray-500/10 border-gray-500/20 text-gray-500";
  }
};

const getStatusIcon = (status) => {
  switch (status) {
    case "COMPLETED":
      return <CheckCircle className="w-5 h-5" />;
    case "PENDING":
      return <AlertCircle className="w-5 h-5" />;
    case "ONGOING":
      return <Clock className="w-5 h-5" />;
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

function TaskCard({
  task,
  handleStatusChange,
  allowEdit = false,
  allowDelete = false,
  allowStatusChange = false,
}) {
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
        <div className="flex flex-col">
          <h3 className="font-semibold text-lg text-white">{task.title}</h3>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">
            {task.status.toLowerCase()}
          </span>
          {getStatusIcon(task.status)}
          {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </div>

      {/* Accordion Content */}
      <div
        className={`transition-max-height duration-500 ease-in-out overflow-hidden
          ${isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"}`}>
        <p className="text-gray-300 my-4 ">{task.description}</p>

        {/* Assigned By */}
        {task.assignedByUser?.username ? (
          <div className="mb-4 text-sm text-gray-400">
            <span className="font-medium text-white">Assigned By: </span>
            <span>{task.assignedByUser.username}</span>
          </div>
        ) : (
          <div className="mb-4 text-sm text-gray-400">
            <span className="font-medium text-white">Assigned By: </span>
            <span>SELF</span>
          </div>
        )}

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

          {task.status == "COMPLETED" && (
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>Completed: {formatDate(task.updatedAt)}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {(allowEdit || allowDelete || allowStatusChange) && (
          <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-700">
            <div className="flex gap-2">
              {allowEdit && (
                <Modal.Open opens="edit-task" taskData={task}>
                  <button className="p-2 text-gray-400 hover:text-white transition-colors">
                    <Edit2 className="w-5 h-5" />
                  </button>
                </Modal.Open>
              )}

              {allowDelete && (
                <Modal.Open opens="delete-task" taskData={task}>
                  <button className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </Modal.Open>
              )}
            </div>

            {allowStatusChange && handleStatusChange && (
              <select
                value={task.status}
                onChange={(e) => handleStatusChange(task.id, e.target.value)}
                className="bg-transparent border border-gray-600 rounded-lg px-3 py-1 text-sm
                text-gray-300 focus:outline-none focus:border-gray-500">
                <option value="ONGOING">Ongoing</option>
                <option value="COMPLETED">Completed</option>
                <option value="PENDING">Pending</option>
              </select>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default TaskCard;
