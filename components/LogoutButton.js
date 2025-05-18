import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";

const Logout = () => {
    const {setAutenticado} = useContext(AuthContext);

    const deslogar = () => {
        sessionStorage.setItem('isAdmin', false)
        setAutenticado(false);
        localStorage.removeItem('token');
    }

    return (
        <button className="botao_logout"onClick={deslogar}>Logoff</button>
    )
}

export default Logout;