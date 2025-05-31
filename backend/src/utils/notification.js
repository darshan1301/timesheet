const prisma = require("../db/prisma-client.js");
const { NOTIFICATION_TYPE } = require("../constant");
const { getClients } = require("./wsManager.js");

const clients = getClients();
async function sendNotification({
  type,
  title,
  message = null,
  targetUserId = null,
  senderId = null,
}) {
  let recipients = [];

  switch (type) {
    case NOTIFICATION_TYPE.Message:
      if (!targetUserId)
        throw new Error("targetUserId is required for MESSAGE type.");
      recipients = [targetUserId];
      break;

    case NOTIFICATION_TYPE.Task:
      if (!targetUserId)
        throw new Error("targetUserId is required for TASK type.");
      recipients = [targetUserId];
      break;

    case NOTIFICATION_TYPE.AttendanceRequest:
      recipients = (
        await prisma.user.findMany({
          where: { role: { in: ["ADMIN", "HR"] }, status: "ACTIVE" },
        })
      ).map((u) => u.id);
      break;

    case NOTIFICATION_TYPE.Announcement:
      recipients = (
        await prisma.user.findMany({
          where: { status: "ACTIVE" },
        })
      ).map((u) => u.id);
      break;

    default:
      throw new Error(`Unknown notification type: ${type}`);
  }

  // Save and send for each recipient
  for (const userId of recipients) {
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
      },
    });

    const ws = clients.get(userId);
    if (ws && ws.readyState === ws.OPEN) {
      ws.send(
        JSON.stringify({
          event: "NEW_NOTIFICATION",
          data: {
            id: notification.id,
            type,
            title,
            message,
            createdAt: notification.createdAt,
            from: senderId || null,
          },
        })
      );
    }
  }
}

module.exports = {
  sendNotification,
};
