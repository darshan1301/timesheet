import { useQuery } from "@tanstack/react-query";
import { getNotifications } from "../services/notification.service";

const useGetNotifications = () => {
  const {
    isLoading,
    data: notifications,
    error,
  } = useQuery({
    queryKey: ["notifications"],
    queryFn: getNotifications,
  });

  return { isLoading, notifications, error };
};

export default useGetNotifications;
