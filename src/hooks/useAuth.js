import { useSelector } from "react-redux";

const useAuth = () => {
  const { accessToken, user } = useSelector((state) => state.auth);
  if (accessToken && user) {
    return true;
  } else {
    return false;
  }
};

export default useAuth;
