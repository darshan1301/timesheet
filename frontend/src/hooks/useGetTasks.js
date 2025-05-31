import { useQuery } from "@tanstack/react-query";
import { getAllTasks } from "../services/task.service";

const useGetTasks = () => {
  const {
    isLoading,
    data: tasks,
    error,
  } = useQuery({
    queryKey: ["tasks"],
    queryFn: getAllTasks,
  });

  return { isLoading, tasks, error };
};

export default useGetTasks;
