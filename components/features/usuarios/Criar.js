'use client';
import React, { useState } from "react";
import styles from '../../../styles/modules/login.module.css'
import Loading from "../../ui/Loading";
import client from "../../../lib/supabaseClient";
import { useRouter } from 'next/router';

const { modal_login, gradient_text, input_login } = styles;

const CriarUsuario = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [emailChecked, setEmailChecked] = useState(false);
    const [seePassword, setSeePassword] = useState(false);
    const [alert, setAlert] = useState(false);
    const [success, setSuccess] = useState(false);
    const [modal, setModal] = useState(null);

    const router = useRouter();

    const checkEmail = async () => {
        setLoading(true);
        const response = await fetch("/api/invited_users/get/one",
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            }
        )
        const text = await response.text();
        const data = JSON.parse(text);

        if (data?.error) {
            setAlert("Error: " + data.error);
            setLoading(false);
            return;
        }

        if(data?.email === email){
            setEmailChecked(true);
            setLoading(false);
        }
    }

    const signUpUser = async () => {
        if (!success) {
            setLoading(true);
            if (password !== confirmPassword) {
                setLoading(false);
                setAlert("Passwords don't match!");
                return;
            }

            const { data, error } = await client.auth.signUp({ email, password });

            if (error) {
                setLoading(false);
                setAlert(error);
                return;
            }
            setLoading(false);
            setSuccess(true);
            setModal("Sign in successfull! Please check your email to confirm it.")
        }

    }

    return (
        <div>
            {loading && <Loading />}

            {modal && (
                <div className="overlay">
                    <div className="modal centered-container">
                        <p>Sign in successfull! Please check your email to confirm it.</p>
                    </div>
                </div>
            )}

            <div className="centered-container" style={{ height: '85vh' }}>
                <div className={modal_login} style={{height: '30rem'}}>
                    <div>
                        <img src={'/images/logo.png'} alt="Logo" style={{ width: '150px' }} /><br />
                        <b className={gradient_text} style={{ fontSize: '20px', marginBottom: '1rem' }}>Sign Up</b>
                    </div>
                    <div className={input_login}>
                        <div>
                            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={emailChecked} />
                        </div>
                        {emailChecked && (
                            <React.Fragment>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <input name="password" type={seePassword ? 'text' : 'password'} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
                                    <div onClick={() => setSeePassword(!seePassword)}>👁️</div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <input name="password" type={seePassword ? 'text' : 'password'} placeholder="Confirm password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                                    <div onClick={() => setSeePassword(!seePassword)}>👁️</div>
                                </div>

                            </React.Fragment>

                        )}

                    </div>
                    <div className={input_login}>
                        {!emailChecked ? (
                            <div>
                                <button className="botao-bonito" onClick={checkEmail}>Check</button>
                                {alert !== '' && <p>{alert}</p>}
                            </div>
                        ) : (
                            <div>
                                <button className="botao-bonito" onClick={signUpUser} disabled={success} style={{ width: '8rem' }}>Create Account</button>
                                {alert !== '' && <p>{alert}</p>}
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
};

export default CriarUsuario;
