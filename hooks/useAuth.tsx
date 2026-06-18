import { useContext } from "react";
import { AuthContext, AuthContextType } from "../contexts/AuthProvider"; // Importe a tipagem junto com o contexto

// Indicamos que o retorno dessa função será obrigatoriamente o AuthContextType
const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);

    // Esse if já funciona como uma "guarda de tipo" para o TypeScript.
    // Ele entende que, se passar daqui, o context nunca será undefined/null.
    if (!context) {
        throw new Error("useAuth must be used inside AuthProvider");
    }

    return context;
};

export default useAuth;