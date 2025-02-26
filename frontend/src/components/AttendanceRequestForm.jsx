import { useState } from "react";
import { toast } from "react-hot-toast";
import { Clock, Calendar, FileText } from "lucide-react";
import { createAttendanceRequest } from "../services/attendanceRequest.service";

const AttendanceRequestForm = ({ onClose, onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    date: "",
    punchIn: "",
    punchOut: "",
    reason: "",
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

    // Validate required fields
    if (!formData.date || !formData.punchIn || !formData.reason) {
      toast.error("Please fill all required fields");
      return;
    }

    // Validate punch-out is after punch-in if provided
    if (formData.punchOut && formData.punchIn >= formData.punchOut) {
      toast.error("Punch-out time must be after punch-in time");
      return;
    }

    setIsLoading(true);
    try {
      await createAttendanceRequest(formData);
      toast.success("Attendance request submitted successfully");
      onSuccess?.();
      onClose?.();
    } catch (error) {
      toast.error(error.message || "Failed to submit request");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold text-white mb-6">
        Submit Attendance Request
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Date */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
            <Calendar className="w-4 h-4" />
            <span>Date</span>
          </label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg
              text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 
              focus:border-transparent"
            required
            disabled={isLoading}
          />
        </div>

        {/* Punch Times - 2 column layout */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
              <Clock className="w-4 h-4" />
              <span>Punch In Time</span>
            </label>
            <input
              type="time"
              name="punchIn"
              value={formData.punchIn}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg
                text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 
                focus:border-transparent"
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
              <Clock className="w-4 h-4" />
              <span>Punch Out Time</span>
            </label>
            <input
              type="time"
              name="punchOut"
              value={formData.punchOut}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg
                text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 
                focus:border-transparent"
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Reason */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
            <FileText className="w-4 h-4" />
            <span>Reason</span>
          </label>
          <textarea
            name="reason"
            value={formData.reason}
            onChange={handleChange}
            rows="3"
            className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg
              text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 
              focus:ring-blue-500/40 focus:border-transparent resize-none"
            placeholder="Please explain why you need this attendance correction"
            required
            disabled={isLoading}
          />
        </div>

        {/* Submit Button */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-lg 
              hover:bg-slate-600 transition-colors disabled:opacity-50">
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg 
              hover:bg-blue-600 transition-colors disabled:opacity-50">
            {isLoading ? "Submitting..." : "Submit Request"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AttendanceRequestForm;
