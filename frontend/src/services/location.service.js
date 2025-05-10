import { baseUrl, getAuthHeaders } from "./config";

export const getAllLocations = async () => {
  try {
    const response = await fetch(`${baseUrl}/location`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch locations");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching locations:", error);
    throw error;
  }
};

export const createLocation = async (locationData) => {
  try {
    const response = await fetch(`${baseUrl}/location`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(locationData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to create location");
    }

    return data;
  } catch (error) {
    console.error("Error creating location:", error);
    throw error;
  }
};

// add try catch block to handle errors
export const deleteLocation = async (locationId) => {
  try {
    const response = await fetch(`${baseUrl}/location/${locationId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error("Failed to delete location");
    }

    return true;
  } catch (error) {
    console.error("Error deleting location:", error);
    throw error;
  }
};

//add try catch block to handle errors and create updateLocation function
export const updateLocation = async (locationData) => {
  try {
    const response = await fetch(`${baseUrl}/location/${locationData.id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(locationData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to update location");
    }

    return data;
  } catch (error) {
    console.error("Error updating location:", error);
    throw error;
  }
};
