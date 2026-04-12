import AuthContext from "@/context/AuthContext";
import { useContext } from "react";

export const useAuth = () => {
    const { user, isAuthenticated, isLoading } = useContext(AuthContext);

    return { user, isAuthenticated, isLoading };
};