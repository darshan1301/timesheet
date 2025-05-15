const prisma = require("../db/prisma-client.js");
const extractLatLng = require("../utils/extractLatLng.js");

const getAllLocations = async (req, res) => {
  try {
    const locations = await prisma.location.findMany({
      select: {
        id: true,
        name: true,
        latitude: true,
        longitude: true,
      },
    });
    res.status(200).json(locations);
  } catch (error) {
    console.error("Error fetching locations:", error);
    res
      .status(500)
      .json({ message: "Error fetching locations", error: error.message });
  }
};

const createLocation = async (req, res) => {
  const { name, locationUrl } = req.body;
  // console.log(req.body);

  const { latitude, longitude } = extractLatLng(locationUrl);
  try {
    const newLocation = await prisma.location.create({
      data: { name, latitude, longitude },
    });

    res.status(201).json(newLocation);
  } catch (error) {
    console.error("Error creating location:", error);
    res
      .status(500)
      .json({ message: "Error creating location", error: error.message });
  }
};

const updateLocation = async (req, res) => {
  const { id } = req.params;
  const { name, locationUrl } = req.body;
  const { latitude, longitude } = extractLatLng(locationUrl);

  try {
    const updatedLocation = await prisma.location.update({
      where: { id: parseInt(id) },
      data: { name, latitude, longitude },
    });

    res.status(200).json(updatedLocation);
  } catch (error) {
    console.error("Error updating location:", error);
    res
      .status(500)
      .json({ message: "Error updating location", error: error.message });
  }
};

const deleteLocation = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.location.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).json({ message: "Location deleted successfully" });
  } catch (error) {
    console.error("Error deleting location:", error);
    res
      .status(500)
      .json({ message: "Error deleting location", error: error.message });
  }
};

module.exports = {
  getAllLocations,
  createLocation,
  updateLocation,
  deleteLocation,
};
