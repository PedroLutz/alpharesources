import { useState, useContext } from "react";
import styles from '../../styles/modules/login.module.css'
import { AuthContext } from "../../contexts/AuthContext";
import Loading from "../ui/Loading";

const { modal_login, gradient_text, input_login } = styles;

const FormularioLogin = () => {
  const { setAutenticado, setIsAdmin } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [alert, setAlert] = useState(null);

  const queryPorNome = async () => {
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        body: JSON.stringify({ usuario, senha }),
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include' // aqui, pra mandar cookie
      });

      if (response.status === 200) return true;
      if (response.status === 401) {
        const erro = await response.json();
        setAlert(erro.error.includes('Senha') ? 'senha' : 'user');
        setLoading(false);
        return false;
      }

      setAlert('erro');
      setLoading(false);
      return false;
    } catch (err) {
      console.error(err);
      setAlert('erro');
      setLoading(false);
      return false;
    }
  };

  const validarCampos = () => {
    if (usuario === '' || senha === '') {
      setAlert('campos');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validarCampos()) {
      return;
    }
    setLoading(true);
    const deuCerto = await queryPorNome();
    if (deuCerto) {
      // depois de logar com sucesso, chama a API pra pegar isAdmin
      try {
        const verificarRes = await fetch('/api/verificaLogin', { credentials: 'include' });
        if (verificarRes.ok) {
          const data = await verificarRes.json();
          setIsAdmin(data.admin);
        } else {
          setIsAdmin(false);
        }
      } catch {
        setIsAdmin(false);
      }
      setAutenticado(true);
      setAlert(null);
    }
    setLoading(false);
  };

  return (
    <div>
      {loading && <Loading />}

      <form onSubmit={handleSubmit}>
        <div className="centered-container" style={{ height: '100vh' }}>
          <div className={modal_login}>
            <div>
              <img src={'/images/logo.png'} alt="Logo" style={{ width: '150px' }} />
              <b className={gradient_text} style={{ fontSize: '20px', marginBottom: '1rem' }}>Alpha Management</b>
            </div>
            <div className={input_login}>
              <div>
                <input type="text" placeholder="Username" value={usuario} onChange={(e) => setUsuario(e.target.value)} />
              </div>
              <div>
                <input type="password" placeholder="Password" value={senha} onChange={(e) => setSenha(e.target.value)} />
              </div>
            </div>
            <div className={input_login}>
              <div>
                <button className="botao-bonito" type="submit">Login</button>
                {alert === 'campos' && <p>Fill all fields!</p>}
                {alert === 'user' && <p>This user doesn't exist!</p>}
                {alert === 'senha' && <p>Wrong password!</p>}
                {alert === 'erro' && <p>Unexpected error occurred. Try again.</p>}
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default FormularioLogin;
