import { setOnUnauthorized } from "@/lib/api";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const AuthBridge: React.FC = () => {
  const { clearUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setOnUnauthorized(() => {
      clearUser();
      navigate("/login", { replace: true });
    });
  }, [clearUser, navigate]);

  return null;
};

export default AuthBridge;
