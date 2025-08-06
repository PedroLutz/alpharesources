'use client';
import { useState, useContext } from "react";
import { useRouter } from 'next/router';
import styles from '../../styles/modules/login.module.css'
import Loading from "../ui/Loading";
import client from "../../lib/supabaseClient";

const { modal_login, gradient_text, input_login } = styles;

const FormularioLogin = () => {
  const [loading, setLoading] = useState(false);
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [alert, setAlert] = useState(null);
  const router = useRouter();

  const validarCampos = () => {
    if (usuario === '' || senha === '') {
      setAlert('campos');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validarCampos()) {
      return;
    }
    setLoading(true);
    const {data, error} = await client.auth.signInWithPassword({
      email: usuario,
      password: senha,
    })
    if(data.user.aud == 'authenticated'){
        router.replace('/');
    }
    setLoading(false);
  };

  return (
    <div>
      {loading && <Loading />}

        <div className="centered-container" style={{ height: '90vh' }}>
          <div className={modal_login}>
            <div>
              <img src={'/images/logo.png'} alt="Logo" style={{ width: '150px' }} />
              <b className={gradient_text} style={{ fontSize: '20px', marginBottom: '1rem' }}>Alpha Management</b>
            </div>
            <div className={input_login}>
              <div>
                <input type="email" placeholder="Username" value={usuario} onChange={(e) => setUsuario(e.target.value)} />
              </div>
              <div>
                <input type="password" placeholder="Password" value={senha} onChange={(e) => setSenha(e.target.value)} />
              </div>
            </div>
            <div className={input_login}>
              <div>
                <button className="botao-bonito" onClick={handleSubmit}>Login</button>
                {alert === 'campos' && <p>Fill all fields!</p>}
                {alert === 'user' && <p>This user doesn't exist!</p>}
                {alert === 'senha' && <p>Wrong password!</p>}
                {alert === 'erro' && <p>Unexpected error occurred. Try again.</p>}
              </div>
            </div>
          </div>
        </div>
    </div>
  );
};

export default FormularioLogin;
