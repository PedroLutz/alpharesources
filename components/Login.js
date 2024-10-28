import { useState, useEffect, useContext} from "react";
import styles from '../styles/modules/login.module.css'
import { AuthContext } from "../contexts/AuthContext";
import Loading from "./Loading";

const {modal_login, gradient_text, input_login} = styles;

const FormularioLogin = () => {
    const {autenticado, setAutenticado, setIsAdmin} = useContext(AuthContext);
    const [loading, setLoading] = useState(false);
    const [usuario, setUsuario] = useState("");
    const [senha, setSenha] = useState("");
    const [alert, setAlert] = useState(null);

    const queryPorNome = async () => {
      try {
        const response = await fetch(`/api/users/getByUser?user=${usuario}`, {
          method: 'GET',
        });
  
        if (response.status === 200) {
          const data = await response.json();
          if(data.usuario[0] === undefined){
            setAlert('user');
            return false;
          }
          return data.usuario[0];
        } else {
          console.error('Error in searching for timeline data');
          return false;
        }
      } catch (error) {
        console.error('Error in searching for financal releases data', error);
        return false;
      }
    }

  
    useEffect(() => {
      const autenticadoString = sessionStorage.getItem('tempoDeSessao');
      
      if (autenticadoString) {
          const autenticadoData = new Date(autenticadoString);
          const agora = new Date();

          if (autenticadoData > agora) {
              setAutenticado(true);
          } else {
              setAutenticado(false);
          }
      } else {
          setAutenticado(false);
      }
  }, []);

    const validarCampos = async (userData) => {
      if(usuario === '' || senha === '' ){
        setAlert('campos');
        setLoading(false);
        return;
      }
      if(senha !== userData.senha){
        setAlert('senha');
        setLoading(false);
        return;
      }
    }
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
      const userData = await queryPorNome();
      if(userData !== false){
        setLoading(false);
        setAlert(null);
        await validarCampos(userData);
        if (senha === userData.senha && usuario === userData.usuario.trim()) {
          var d = new Date();
          d.setMinutes(d.getMinutes() + 60);
          sessionStorage.setItem('tempoDeSessao', d.toString());
          sessionStorage.setItem('isAdmin', userData.admin)
    
          setAutenticado(true);
          setIsAdmin(userData.admin);
        };
      }
      
      
    };
  
    return (
      <div>
        {loading && <Loading/>}
        
<form onSubmit={handleSubmit}>
        <div className="centered-container" style={{height: '100vh'}}>
          <div className={modal_login}>
            <div>
              <img src={'/images/logo.png'} alt="Logo" style={{width: '150px'}}/>
              <b className={gradient_text} style={{fontSize: '20px', marginBottom: '1rem'}}>Alpha Management</b>
            </div>
            <div className={input_login}>
              <div>
                <input type="text" placeholder="Username" value={usuario} onChange={(e) => setUsuario(e.target.value)}/>
                
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
              </div>
            </div>
          </div>
        </div>
      </form>
      </div>
      
    );
  };

  export default FormularioLogin;