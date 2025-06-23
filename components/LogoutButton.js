import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";

const Logout = () => {
    const { setAutenticado } = useContext(AuthContext);

    const deslogar = async () => {
        try {
            await fetch('/api/logout', {
                method: 'POST',
            });

            setAutenticado(false);
            sessionStorage.setItem('isAdmin', false);
        } catch (err) {
            console.error('Erro ao fazer logout', err);
        }
    };

    return (
        <button className="botao_logout" onClick={deslogar}>Logoff</button>
    );
};

export default Logout;
