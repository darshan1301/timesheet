const express = require("express");
const {
  punchInOut,
  createAttendanceRequest,
  getCurrentPunchStatus,
  getAttendanceRequests,
} = require("../controllers/attendanceController");
const { authRole } = require("../middleware/authentication");

const router = express.Router();

router.post("/punchingmachine", punchInOut);
router.get("/status", getCurrentPunchStatus);
router.post("/", createAttendanceRequest);

router.get("/requests", getAttendanceRequests);
// router.delete("/:id", (req, res) => {});

module.exports = router;
