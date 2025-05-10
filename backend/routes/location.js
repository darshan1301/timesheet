const express = require("express");
const {
  getAllLocations,
  createLocation,
  updateLocation,
  deleteLocation,
} = require("../controllers/locationController");

const router = express.Router();

router.get("/", getAllLocations);
router.post("/", createLocation);
router.put("/:id", updateLocation);
router.delete("/:id", deleteLocation);

module.exports = router;
