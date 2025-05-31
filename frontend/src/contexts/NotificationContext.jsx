/* eslint-disable react/prop-types */
import { createContext, useContext, useEffect, useRef } from "react";
import { toast } from "react-hot-toast";
import { wsUrl } from "../services/config";
import { getIcon } from "../pages/NotificationsPage";
import { useQueryClient } from "@tanstack/react-query";
import { Howl } from "howler";
import bellSound from "../assets/sounds/notification-2.mp3";

const notificationSound = new Howl({
  src: [bellSound],
  volume: 1,
  preload: true,
});

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export function NotificationProvider({ children }) {
  const socketRef = useRef(null);
  const queryClient = useQueryClient();

  // ✅ WebSocket purely to listen and trigger refresh + show toast
  useEffect(() => {
    const token = localStorage.getItem("jwtToken");
    if (!token) {
      console.warn("No token found, WebSocket not connecting.");
      return;
    }
    const ws = new WebSocket(`${wsUrl}`);
    socketRef.current = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({ token }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.event === "NEW_NOTIFICATION") {
          notificationSound.play();
          const notif = data.data;
          showCustomToast(notif);
          queryClient.setQueryData(["notifications"], (old = []) => [
            notif,
            ...old,
          ]);
        }
      } catch (err) {
        console.error("Invalid WebSocket message:", event.data, err);
      }
    };

    ws.onclose = () => console.log("WebSocket closed.");
    ws.onerror = (error) => console.error("WebSocket error:", error);

    return () => {
      ws.close();
    };
  }, []);

  // ✅ Expose notifications, loading and refresh on-demand
  return (
    <NotificationContext.Provider value={""}>
      {children}
    </NotificationContext.Provider>
  );
}

function showCustomToast(notification) {
  toast.custom((t) => (
    <div
      className={`${
        t.visible ? "animate-enter" : "animate-leave"
      } max-w-md w-full bg-slate-800 border border-slate-600 rounded-lg shadow-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
      <div className="flex-1 w-0 p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">{getIcon(notification.type)}</div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-white">
              {notification.title}
            </p>
            {notification.message && (
              <p className="mt-1 text-sm text-gray-300">
                {notification.message}
              </p>
            )}
          </div>
        </div>
      </div>
      <div className="flex border-l border-slate-600">
        <button
          onClick={() => toast.dismiss(t.id)}
          className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-blue-400 hover:text-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500">
          Close
        </button>
      </div>
    </div>
  ));
}
