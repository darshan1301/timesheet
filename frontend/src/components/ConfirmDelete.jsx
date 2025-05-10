/* eslint-disable react/prop-types */
import { AlertCircle } from "lucide-react";

const ConfirmDelete = ({ location, onDelete, onClose }) => (
  <div className="text-center">
    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
    <h3 className="text-xl font-semibold text-white mb-2">Are you sure?</h3>
    <p className="text-gray-400 mb-6">
      Do you really want to delete
      <span className="text-white font-medium">{` ${location.name}`}</span>?
      This action cannot be undone.
    </p>

    <div className="flex justify-center gap-4 mt-6">
      <button
        type="button"
        onClick={onClose}
        className="px-6 py-2 border border-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors">
        Cancel
      </button>
      <button
        type="button"
        onClick={() => onDelete(location.id)}
        className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
        Delete
      </button>
    </div>
  </div>
);

export default ConfirmDelete;
