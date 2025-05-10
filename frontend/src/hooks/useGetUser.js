import { useQuery } from "@tanstack/react-query";
import { checkPunchStatus } from "../services/punchingmachine.service";

const useGetUser = () => {
  const {
    isLoading,
    data: userinfo,
    error,
  } = useQuery({
    queryKey: ["userinfo"],
    queryFn: checkPunchStatus,
  });

  return { isLoading, userinfo, error };
};

export default useGetUser;
