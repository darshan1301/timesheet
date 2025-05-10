/* eslint-disable react/prop-types */
import { useForm } from "react-hook-form";

const LocationFormFields = ({ locationForm = {}, onSubmit, onClose }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues: locationForm });

  // Wrap onSubmit to close modal on success
  const submitAndClose = handleSubmit(async (data) => {
    await onSubmit(data);
    onClose();
  });

  return (
    <form onSubmit={submitAndClose} className="grid grid-cols-1 gap-6">
      {/* Name Field */}
      <div className="flex flex-col gap-2">
        <label className="text-gray-300 font-medium">Name</label>
        <input
          {...register("name", { required: "Name is required" })}
          placeholder="Location name"
          className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-transparent"
        />
        {errors.name && (
          <span className="text-red-400 text-sm">{errors.name.message}</span>
        )}
      </div>

      {/* Google Maps URL Field */}
      <div className="flex flex-col gap-2">
        <label className="text-gray-300 font-medium">Google Maps URL</label>
        <input
          {...register("locationUrl", {
            required: "URL is required",
            pattern: {
              value: /https?:\/\/.+google\.com\/maps\//,
              message: "Enter a valid Google Maps URL",
            },
          })}
          placeholder="Paste Google Maps link (e.g., https://www.google.com/maps/...)"
          className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-transparent"
        />
        {errors.locationUrl && (
          <span className="text-red-400 text-sm">
            {errors.locationUrl.message}
          </span>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between mt-4 gap-2">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 border border-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors">
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors">
          Submit
        </button>
      </div>
    </form>
  );
};

export default LocationFormFields;
