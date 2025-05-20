import { CheckCircle, AlertCircle, Bell, Mail } from "lucide-react";
import useGetNotifications from "../hooks/useGetNotifications";
import Loader from "../components/Loader";
import { useNavigate } from "react-router-dom";
import { NOTIFICATION_TYPE } from "../constants";
import { markNotificationAsRead } from "../services/notification.service";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";

export const mockNotifications = [
  {
    id: 1,
    type: "TASK",
    title: "New Task Assigned",
    message: "You have been assigned a task: 'Prepare monthly report'.",
    isRead: false,
    createdAt: "2025-05-17T10:30:00Z",
  },
  {
    id: 2,
    type: "ATTENDANCE_REQUEST",
    title: "New Attendance Request",
    message: "You have a new attendance request from Ramesh Kumar.",
    isRead: false,
    createdAt: "2025-05-17T09:15:00Z",
  },
  {
    id: 3,
    type: "ANNOUNCEMENT",
    title: "Company Announcement",
    message: "Don't forget the team meeting at 4 PM today.",
    isRead: true,
    createdAt: "2025-05-16T18:45:00Z",
  },
  {
    id: 4,
    type: "MESSAGE",
    title: "New Message",
    message: "Hi, can you check the latest task status?",
    isRead: false,
    createdAt: "2025-05-17T08:00:00Z",
  },
];

export const getIcon = (type) => {
  switch (type) {
    case "TASK":
      return <CheckCircle className="w-6 h-6 text-blue-400" />;
    case "ATTENDANCE_REQUEST":
      return <AlertCircle className="w-6 h-6 text-yellow-400" />;
    case "ANNOUNCEMENT":
      return <Bell className="w-6 h-6 text-green-400" />;
    case "MESSAGE":
      return <Mail className="w-6 h-6 text-purple-400" />;
    default:
      return <Bell className="w-6 h-6 text-gray-400" />;
  }
};

export default function NotificationsPage() {
  const { isLoading, notifications } = useGetNotifications();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  if (isLoading) {
    return <Loader />;
  }

  const totalCount = notifications.length;
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  if (totalCount === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-400">Your box is empty!</p>
      </div>
    );
  }

  async function handleNotificationClick(notification) {
    try {
      toast.loading("Loading...");
      await markNotificationAsRead(notification.id);
      queryClient.setQueryData(["notifications"], (old = []) =>
        old.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n))
      );
      switch (notification.type) {
        case NOTIFICATION_TYPE.Task:
          navigate("/task-list");
          break;
        case NOTIFICATION_TYPE.AttendanceRequest:
          navigate("/attendance-requests");
          break;
        case NOTIFICATION_TYPE.Announcement:
          // Navigate to announcement page
          break;
        case NOTIFICATION_TYPE.Message:
          // Navigate to message page
          break;
        default:
          // Handle unknown notification type
          console.error("Unknown notification type:", notification.type);
          break;
      }
    } catch (error) {
      console.error("Error handling notification click:", error);
    }
  }

  return (
    <div className="lg:p-6 p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Notifications</h1>
          <p className="text-sm text-gray-400">
            {totalCount} Total • {unreadCount} New
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {notifications.length === 0 ? (
          <div className="text-center text-gray-400 mt-12">
            <p>No notifications yet.</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              className={`flex items-start gap-4 p-4 rounded-lg border bg-slate-900/50 border-slate-700 shadow-md ${
                n.isRead
                  ? "opacity-60"
                  : "opacity-100 hover:opacity-90 transition-opacity"
              }`}>
              <div className="mt-1">{getIcon(n.type)}</div>
              <div className="flex-1">
                <div className="font-semibold text-white">{n.title}</div>
                <div className="text-sm text-gray-400">{n.message}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {new Date(n.createdAt).toLocaleString()}
                </div>
              </div>
              {!n.isRead && (
                <button
                  onClick={() => handleNotificationClick(n)}
                  className="text-sm bg-blue-500 text-white rounded px-3 py-1 hover:bg-blue-600 transition-colors">
                  OPEN
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
