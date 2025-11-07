import { useState, useEffect } from "react";
import Modal from '../../ui/Modal';
import Loading from "../../ui/Loading";
import styles from '../../../styles/modules/user_settings.module.css'
import client from "../../../lib/supabaseClient";
import { useRouter } from 'next/router';

const ResetPassword = () => {

    const router = useRouter();

    const passwordDataEmpty = {
        password: '',
        confirmPassword: ''
    }
    const [passwordData, setPasswordData] = useState(passwordDataEmpty);

    const [showModal, setShowModal] = useState(null); 
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        let hash = window.location.hash || sessionStorage.getItem('supabaseHash')
        if (hash == null) router.replace('/');
        const params = new URLSearchParams(hash?.substring(1))
        const access_token = params.get('access_token')
        const refresh_token = params.get('refresh_token')
        const type = params.get('type')

        const init = async () => {
            if (type === 'recovery' && access_token && refresh_token) {
                await client.auth.setSession({ access_token, refresh_token })
            } else router.replace('/');
        }

        init()
    }, [])

    /**
    *  Detect the adequate state object and update the changes to the inputs
    * @param {object} e - The html input element
    * @param {string} section - "email", "password" or "colors", indicating the state object that should be updated
    */
    const handleChange = (e) => {
        const { name, value } = e.target;
        setPasswordData({
            ...passwordData,
            [name]: value
        });
    }

    const updatePassword = async () => {
        setLoading(true);

        if(passwordData.password !== passwordData.confirmPassword){
            setShowModal("The passwords do not match!");
            setLoading(false);
        }

        const { error } = await client.auth.updateUser({
            password: passwordData.password
        })

        if(error) setShowModal("Error while updating: " + error)
        else setShowModal("Update success!");

        setLoading(false);
        setPasswordData(passwordDataEmpty);
    }

    return (
        <div className="centered-container">

            {loading && <Loading/>}
            {showModal != null && (
                <Modal objeto={{
                    titulo: showModal,
                    botao1: {
                        funcao: () => router.replace("/login"), texto: 'Return to log in'
                    },
                }} />
            )}

            <div className={styles.wrapper}>
                <div>
                    <div className={styles.block}>
                        <h3>Change password</h3>
                        <input
                            name="password"
                            value={passwordData.password}
                            onChange={handleChange}
                            placeholder="Password"
                        />
                        <input
                            name="confirmPassword"
                            value={passwordData.confirmPassword}
                            onChange={handleChange}
                            placeholder="Confirm password"
                        />
                        <button onClick={updatePassword}>Update</button>
                    </div>

                </div>
            </div>

        </div>
    )
}

export default ResetPassword;