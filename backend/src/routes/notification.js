const express = require("express");
const {
  getNotifications,
  deleteNotification,
  markNotificationAsRead,
} = require("../controllers/notificationController");

const router = express.Router();

router.get("/", getNotifications);
router.patch("/:notificationId", markNotificationAsRead);
router.delete("/:notificationId", deleteNotification);

module.exports = router;
