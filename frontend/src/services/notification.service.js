import { baseUrl, getAuthHeaders } from "./config";

const authHeaders = getAuthHeaders();

export const getNotifications = async () => {
  const response = await fetch(`${baseUrl}/notifications`, {
    method: "GET",
    headers: authHeaders,
  });

  if (!response.ok) {
    throw new Error("Failed to fetch notifications");
  }

  const data = await response.json();
  return data;
};

export const markNotificationAsRead = async (notificationId) => {
  const response = await fetch(`${baseUrl}/notifications/${notificationId}`, {
    method: "PATCH",
    headers: authHeaders,
    body: JSON.stringify({ isRead: true }),
  });

  if (!response.ok) {
    throw new Error("Failed to mark notification as read");
  }

  return response.json();
};

export const deleteNotification = async (notificationId) => {
  const response = await fetch(`${baseUrl}/notifications/${notificationId}`, {
    method: "DELETE",
    headers: authHeaders,
  });

  if (!response.ok) {
    throw new Error("Failed to delete notification");
  }

  return response.json();
};
