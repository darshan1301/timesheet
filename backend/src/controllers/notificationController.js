const prisma = require("../db/prisma-client");

const getNotifications = async (req, res) => {
  const { userId } = req.user;

  try {
    // Fetch notifications for the logged-in user
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error.message);
    res.status(500).send("Error fetching notifications.");
  }
};

const markNotificationAsRead = async (req, res) => {
  const { notificationId } = req.params;
  const { userId } = req.user;

  try {
    // Find the notification by ID
    const notification = await prisma.notification.findUnique({
      where: { id: parseInt(notificationId) },
    });

    if (!notification) {
      return res.status(404).json({ message: "Notification not found." });
    }

    // Check if the notification belongs to the logged-in user
    if (notification.userId !== userId) {
      return res
        .status(403)
        .json({ message: "Unauthorized to mark this notification." });
    }

    // Update the notification as read
    await prisma.notification.update({
      where: { id: notification.id },
      data: { isRead: true },
    });

    res.status(200).json({ message: "Notification marked as read." });
  } catch (error) {
    console.error("Error marking notification as read:", error.message);
    res.status(500).json({ message: "Error marking notification as read." });
  }
};

const deleteNotification = async (req, res) => {
  const { notificationId } = req.params;
  const { userId } = req.user;

  try {
    // Find the notification by ID
    const notification = await prisma.notification.findUnique({
      where: { id: parseInt(notificationId) },
    });

    if (!notification) {
      return res.status(404).json({ message: "Notification not found." });
    }

    // Check if the notification belongs to the logged-in user
    if (notification.userId !== userId) {
      return res
        .status(403)
        .json({ message: "Unauthorized to delete this notification." });
    }

    // Delete the notification
    await prisma.notification.delete({
      where: { id: notification.id },
    });

    res.status(200).json({ message: "Notification deleted successfully." });
  } catch (error) {
    console.error("Error deleting notification:", error.message);
    res.status(500).json({ message: "Error deleting notification." });
  }
};

module.exports = {
  getNotifications,
  markNotificationAsRead,
  deleteNotification,
};
