import { useContext } from "react";
import { AuthContext, AuthContextType } from "../contexts/AuthProvider";

const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth must be used inside AuthProvider");
    }

    return context;
};

export default useAuth;