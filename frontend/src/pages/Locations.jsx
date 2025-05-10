/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import {
  MapPin,
  Search,
  PlusCircle,
  Edit,
  Trash2,
  AlertCircle,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Loader from "../components/Loader";
import {
  createLocation,
  deleteLocation,
  getAllLocations,
  updateLocation,
} from "../services/location.service";
import LocationFormFields from "../components/LocationFormFields";
import Modal from "../components/Modal";
import ConfirmDelete from "../components/ConfirmDelete";

const LocationsPage = () => {
  const [locations, setLocations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchLocations = async () => {
      setIsLoading(true);
      try {
        const data = await getAllLocations();
        setLocations(data);
      } catch (error) {
        console.error("Error fetching locations:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLocations();
  }, []);

  const filteredLocations = locations.filter((location) =>
    location.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddSubmit = async (data) => {
    const { name, locationUrl } = data;
    if (!name || !locationUrl) {
      toast.error("Please fill in all fields");
      return;
    }

    const newLocation = { name, locationUrl };

    try {
      toast.loading("Adding location...");
      const createdLocation = await createLocation(newLocation);
      setLocations((prev) => [...prev, createdLocation]);
      toast.dismiss();
      toast.success("Location added successfully!");
    } catch (error) {
      toast.dismiss();
      toast.error("Failed to add location");
      console.error("Error adding location:", error);
    }
  };

  const handleEditSubmit = async (data) => {
    toast.loading("Updating location...");
    const { name, locationUrl } = data;
    if (!name || !locationUrl) {
      toast.error("Please fill in all fields");
      return;
    }

    const updatedLocation = {
      id: data.id,
      name,
      locationUrl,
    };

    try {
      await updateLocation(data);
      // setLocations((prev) =>
      //   prev.map((loc) => (loc.id === data.id ? updatedLocation : loc))
      // );
      toast.success("Location updated successfully!");
    } catch (err) {
      toast.error("Failed to update location");
      console.error(err);
    }
  };

  const handleDeleteSubmit = async (locationId) => {
    toast.loading("Deleting location...");
    try {
      await deleteLocation(locationId);
      setLocations((prev) => prev.filter((loc) => loc.id !== locationId));
      toast.success("Location deleted successfully!");
    } catch (err) {
      toast.error("Failed to delete location");
      console.error(err);
    }
  };

  return (
    <div className="p-6">
      {/* Header and Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <MapPin className="w-6 h-6" />
          Locations
        </h1>

        {/* Search and Add Button */}
        <Modal>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search locations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg
              text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 
              focus:ring-blue-500/40 focus:border-transparent"
              />
            </div>
            <Modal.Open opens="add-location">
              <button
                className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 
            transition-colors flex items-center gap-2 whitespace-nowrap">
                <PlusCircle size={18} />
                <span className="hidden sm:inline">Add Location</span>
              </button>
            </Modal.Open>
            <Modal.Window name="add-location">
              <LocationFormFields onSubmit={handleAddSubmit} />
            </Modal.Window>
          </div>
        </Modal>
      </div>

      {/* Locations Grid */}
      {isLoading ? (
        <Loader />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLocations.length === 0 ? (
            <div className="col-span-full bg-slate-800/40 backdrop-blur-sm rounded-xl border border-slate-700 p-8 text-center">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                No Locations Found
              </h3>
              <p className="text-gray-400">
                {searchTerm
                  ? `No locations match "${searchTerm}". Try a different search term.`
                  : "No locations have been added yet. Click 'Add Location' to create your first location."}
              </p>
            </div>
          ) : (
            filteredLocations.map((location) => (
              <Modal key={location.id}>
                <div
                  key={location.id}
                  className="bg-slate-800/40 backdrop-blur-sm rounded-xl border border-slate-700 p-6 flex flex-col">
                  {/* Header: Location Name */}
                  <div className="mb-4">
                    <h3 className="font-semibold text-lg text-white mb-1">
                      {location.name}
                    </h3>
                  </div>

                  {/* Location Details */}
                  <div className="flex flex-col gap-3 text-sm text-gray-400 mb-6">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-blue-400" />
                      <span>
                        {location.latitude.toFixed(6)},{" "}
                        {location.longitude.toFixed(6)}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-auto pt-4 border-t border-slate-700 flex justify-between">
                    <Modal.Open opens="edit-location">
                      <button className="text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1">
                        <Edit size={16} />
                        <span>Edit</span>
                      </button>
                    </Modal.Open>
                    <Modal.Open opens="delete-location">
                      <button className="text-red-400 hover:text-red-300 transition-colors flex items-center gap-1">
                        <Trash2 size={16} />
                        <span>Delete</span>
                      </button>
                    </Modal.Open>
                    <Modal.Window name="edit-location">
                      <LocationFormFields
                        locationForm={location}
                        onSubmit={handleEditSubmit}
                      />
                    </Modal.Window>
                    <Modal.Window name="delete-location">
                      <ConfirmDelete
                        onDelete={handleDeleteSubmit}
                        location={location}
                      />
                    </Modal.Window>
                  </div>
                </div>
              </Modal>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default LocationsPage;
