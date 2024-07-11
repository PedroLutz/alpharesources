import { useState, useEffect } from "react";
import styles from '../styles/modules/login.module.css'

const {modal_login, gradient_text, input_login} = styles;

const FormularioLogin = ({autenticacao}) => {
    const {autenticar, isAutenticado} = autenticacao;
    const [usuario, setUsuario] = useState("");
    const [userInfo, setUserInfo] = useState("");
    const [senha, setSenha] = useState("");
    const [alert, setAlert] = useState(null);

    const fetchAutenticacao = async () => {
      try {
        const response = await fetch('/api/login', {
          method: 'GET',
        });
  
        if (response.status === 200) {
          const data = await response.json();
          setUserInfo(data.usuario[0]);
        } else {
          console.error('Error in searching for timeline data');
        }
      } catch (error) {
        console.error('Error in searching for financal releases data', error);
      }
    };

  
    useEffect(() => {
      const autenticadoString = sessionStorage.getItem('tempoDeSessao');
      
      if (autenticadoString) {
          const autenticadoData = new Date(autenticadoString);
          const agora = new Date();

          if (autenticadoData > agora) {
              autenticar(true);
          } else {
              autenticar(false);
          }
      } else {
          autenticar(false);
      }
      fetchAutenticacao(); 
  }, []);

    const validarCampos = () => {
      if(usuario === '' || senha === '' ){
        setAlert('campos');
        return;
      }
      if(usuario !== userInfo.usuario.trim()){
        setAlert('user');
        return;
      }
      if(senha !== userInfo.senha){
        setAlert('senha');
        return;
      }
    }
  
    const handleSubmit = (e) => {
      e.preventDefault();
      setAlert(null);
      validarCampos();
      if (senha === userInfo.senha && usuario === userInfo.usuario.trim()) {
        var d = new Date();
        d.setMinutes(d.getMinutes() + 60);
        
        sessionStorage.setItem('tempoDeSessao', d.toString());
  
        autenticar(true);
      };
      
    };
  
    return (
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
    );
  };

  export default FormularioLogin;