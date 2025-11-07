import { useState } from "react";
import useAuth from "../../../hooks/useAuth";
import usePerm from "../../../hooks/usePerm";
import Modal from '../../ui/Modal';
import Loading from "../../ui/Loading";
import styles from '../../../styles/modules/user_settings.module.css'
import client from "../../../lib/supabaseClient";

const Atualizar = () => {
    const { isEditor } = usePerm();
    const { user } = useAuth();

    const emailDataEmpty = {
        email: '',
        confirmEmail: ''
    }
    const [emailData, setEmailData] = useState(emailDataEmpty);

    const [showModal, setShowModal] = useState(null); 
    const [loading, setLoading] = useState(false);

    /**
    *  Detect the adequate state object and update the changes to the inputs
    * @param {object} e - The html input element
    * @param {string} section - "email", "password" or "colors", indicating the state object that should be updated
    */
    const handleChange = (e) => {
        const { name, value } = e.target;

        setEmailData({
            ...emailData,
            [name]: value
        }); 
    }

    const updateEmail = async () => {
        setLoading(true);

        if(emailData.email !== emailData.confirmEmail){
            setShowModal("The emails do not match!");
            setLoading(false);
        }

        const { error } = await client.auth.updateUser({
            email: emailData.email
        })

        if(error) setShowModal("Error while updating: " + error)
        else setShowModal("Success! Please check your old email and your new email to confirm the change.");

        setLoading(false);
        setEmailData(emailDataEmpty);
    }

    const requestPasswordChange = async () => {
        setLoading(true);
        await client.auth.resetPasswordForEmail(user.email, {
            redirectTo: `${window.location.origin}/reset_password`
        })
        setShowModal("Please check your email to proceed with the password change.");
        setLoading(false);
    }

    return (
        <div className="centered-container">

            {loading && <Loading/>}
            {showModal != null && (
                <Modal objeto={{
                    titulo: showModal,
                    botao1: {
                        funcao: () => setShowModal(null), texto: 'Okay'
                    },
                }} />
            )}

            <div className={styles.wrapper}>
                <div>
                    <h2>Account information</h2>
                    <div className={styles.block}>
                        <h3>Change email</h3>

                        <input
                            name="email"
                            value={emailData.email}
                            onChange={(e) => handleChange(e)}
                            placeholder="Email"
                        />
                        <input
                            name="confirmEmail"
                            value={emailData.confirmEmail}
                            onChange={(e) => handleChange(e)}
                            placeholder="Confirm email" />
                        <button onClick={updateEmail} disabled={!isEditor}>Update</button>


                    </div>
                    <div className={styles.block}>
                        <h3>Change password</h3>
                        <button onClick={requestPasswordChange} disabled={!isEditor}>Request change</button>

                    </div>

                </div>
            </div>

        </div>
    )
}

export default Atualizar;