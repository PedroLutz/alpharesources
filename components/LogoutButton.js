import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";

const Logout = () => {
    const {setAutenticado} = useContext(AuthContext);

    const deslogar = () => {
        sessionStorage.setItem('tempoDeSessao', null)
        setAutenticado(false);
    }

    return (
        <button className="botao_logout"onClick={deslogar}>Logoff</button>
    )
}

export default Logout;