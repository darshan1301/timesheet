const express = require("express");
const {
  userUpdate,
  getAllAttendanceRequests,
  getUserAttendance,
  getUsersList,
  createUser,
  getUserTasks,
  getAttendanceSheet,
  exportAttendanceSheet,
  assignTask,
} = require("../controllers/dashboardController");
const {
  updateAttendanceRequest,
} = require("../controllers/attendanceController");

const router = express.Router();

// router.patch("/", userUpdate);
router.get("/getTasks/:employeeId", getUserTasks);
router.get("/getUserAttendance/:employeeUsername", getUserAttendance);
router.get("/attendanceRequests", getAllAttendanceRequests);
router.get("/usersList", getUsersList);
router.post("/", createUser);
router.patch("/:id", updateAttendanceRequest);
router.get("/attendance/sheet", getAttendanceSheet);
router.get("/attendance/export", exportAttendanceSheet);
router.post("/assignTask", assignTask);

module.exports = router;
