import { useState, useEffect } from "react";

const FormularioLogin = ({autenticacao}) => {
    const {autenticar, isAutenticado} = autenticacao;
    const [usuario, setUsuario] = useState("");
    const [userInfo, setUserInfo] = useState("");
    const [senha, setSenha] = useState("");

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
  
    const handleSubmit = (e) => {
      e.preventDefault();
      if (senha === userInfo.senha && usuario === userInfo.usuario.trim()) {
        var d = new Date();
        d.setMinutes(d.getMinutes() + 60);
        
        sessionStorage.setItem('tempoDeSessao', d.toString());
        
        autenticar(true);
      } else {
        alert("Usuário ou senha inválidos!");
      }
    };
  
    return (
      <form onSubmit={handleSubmit}>
        <div className="centered-container" style={{height: '100vh'}}>
          <div className="modal-login">
            <div>
              <img src={'/images/logo.png'} alt="Logo" style={{width: '150px'}}/>
              <b className="gradient-text" style={{fontSize: '20px'}}>Alpha Management</b>
            </div>
            <div className="mini-input">
              <div>
                <input type="text" placeholder="Username" value={usuario} onChange={(e) => setUsuario(e.target.value)}/>
              </div>
              <div>
                <input type="password" placeholder="Password" value={senha} onChange={(e) => setSenha(e.target.value)} />
              </div>
            </div>
            <div>
              <div >
                <button className="botao-cadastro" type="submit">Login</button>
              </div>
            </div>
          </div>
        </div>
      </form>
    );
  };

  export default FormularioLogin;