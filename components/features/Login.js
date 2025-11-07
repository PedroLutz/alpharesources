'use client';
import { useState } from "react";
import { useRouter } from 'next/router';
import styles from '../../styles/modules/login.module.css'
import Loading from "../ui/Loading";
import client from "../../lib/supabaseClient";
import { useEffect } from "react";

const { modal_login, gradient_text, input_login } = styles;

const FormularioLogin = () => {
  const [loading, setLoading] = useState(false);
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [alert, setAlert] = useState(null);
  const [resetPasswordAlert, setResetPasswordAlert] = useState("");
  const [modal, setModal] = useState(false);
  const router = useRouter();

  const validarCampos = () => {
    if (usuario === '' || senha === '') {
      setAlert('Fill out all fields!');
      return false;
    }
    return true;
  };

  useEffect(() => {
    const init = async () => {
      await client.auth.signOut();
    }
    
    init();
  }, [])

  const handleSubmit = async () => {
    if (!validarCampos()) {
      return;
    }
    setLoading(true);
    await client.auth.signOut();
    const { data, error } = await client.auth.signInWithPassword({
      email: usuario,
      password: senha,
    })
    if (error) {
      if (error?.name === 'AuthApiError') {
        setAlert(getAlertMessage[error.message])
      } else {
        setAlert('An unexpected error happened. Please try again later!');
      }
      console.error(error);
    } else if (data.user?.aud === 'authenticated') {
      router.replace('/');
    }
    setLoading(false);
  };

  const requestPasswordChange = async () => {
        setLoading(true);
        const {data, error } = await client.auth.resetPasswordForEmail(usuario, {
            redirectTo: `${window.location.origin}/reset_password`
        })
        setResetPasswordAlert(error ? `Error: ${error}` : `Please check your email to proceed with the password change.`);
        setLoading(false);
    }

  const getAlertMessage = {
    'Invalid login credentials': 'Invalid login credentials!',
    'Email not confirmed': 'Check your email to verify your account!',
    'Email rate limit exceeded': 'Please try again later!',
    'User not found': 'User not found!',
  }

  return (
    <div className="centered-container">
      {modal && (
                <div className="overlay">
                    <div className="modal">
                        <p>Type your email: </p>
                        <div className={input_login}>
                          <div>
                            <input type="email" placeholder="Username" value={usuario} onChange={(e) => setUsuario(e.target.value)} />
                            {resetPasswordAlert !== ""&&<p>{resetPasswordAlert}</p>}
                          </div>
                        </div>
                        <div className="mesma-linha">
                          <button className="botao-padrao" onClick={requestPasswordChange}>
                          Send
                        </button>
                        <button className="botao-padrao" onClick={() => setModal(false)}>
                          Cancel
                        </button>
                        </div>
                    </div>
                </div>
            )}
      {loading && <Loading />}

      <div className="centered-container" style={{ height: '90vh' }}>
        <div className={modal_login}>
          <div>
            <img src={'/images/logo.png'} alt="Logo" style={{ width: '150px' }} />
            <b className={gradient_text} style={{ fontSize: '20px', marginBottom: '1rem' }}>Alpha Management</b>
          </div>
          <button className={styles.forgot_password} onClick={() => setModal(true)}>Forgot your password?</button>
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
              {alert !== '' && <p>{alert}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormularioLogin;
