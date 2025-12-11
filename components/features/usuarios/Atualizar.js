import { useState, useEffect } from "react";
import useAuth from "../../../hooks/useAuth";
import usePerm from "../../../hooks/usePerm";
import useColor from "../../../hooks/useColor";
import Modal from '../../ui/Modal';
import Loading from "../../ui/Loading";
import styles from '../../../styles/modules/user_settings.module.css'
import client from "../../../lib/supabaseClient";
import { handleReq } from "../../../functions/crud_s";

const Atualizar = () => {
    const { isEditor } = usePerm();
    const { user, token } = useAuth();
    const { colors } = useColor();
    const user_id = user.id;

    const emailDataEmpty = {
        email: '',
        confirmEmail: ''
    }
    const [emailData, setEmailData] = useState(emailDataEmpty);

    const colorsDataVazio = {
        main: '',
        secondary: '',
        table_header: ''
    }
    const [colorsData, setColorsData] = useState(colorsDataVazio);

    useEffect(() => {
        setColorsData({
            ...colors
        })
    }, [colors])

    const [showModal, setShowModal] = useState(null); 
    const [loading, setLoading] = useState(false);

    /**
    *  Detect the adequate state object and update the changes to the inputs
    * @param {object} e - The html input element
    * @param {string} section - "email", "password" or "colors", indicating the state object that should be updated
    */
    const handleChange = (e, section) => {
        const { name, value } = e.target;

        switch (section) {
            case "email": {
                setEmailData({
                    ...emailData,
                    [name]: value
                });
                break;
            }

            case "password": {
                setPasswordData({
                    ...passwordData,
                    [name]: value
                });
                break;
            }

            case "colors": {
                setColorsData({
                    ...colorsData,
                    [name]: value
                })
            }
        }
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
        setPasswordData(passwordDataEmpty);
    }

    const requestPasswordChange = async () => {
        setLoading(true);
        await client.auth.resetPasswordForEmail(user.email, {
            redirectTo: `${window.location.origin}/reset_password`
        })
        setShowModal("Please check your email to proceed with the password change.");
        setLoading(false);
    }

    const updateColors = async () => {
        setLoading(true);
        const isUpdate = colors?.main != null && colors?.secondary != null && colors?.table_header != null;

        var obj = {
            main: colorsData?.main || "#fff",
            secondary: colorsData?.secondary || "#fff",
            table_header: colorsData?.table_header || "#fff",
        };
        if(isUpdate){
            obj = {...obj, id: colors?.id};
        } else {
            obj = {...obj, user_id};
        }
        await handleReq({
            table: 'color',
            route: isUpdate ? 'update' : 'create',
            data: obj,
            token
        });
        window.location.reload();
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
                            onChange={(e) => handleChange(e, "email")}
                            placeholder="Email"
                        />
                        <input
                            name="confirmEmail"
                            value={emailData.confirmEmail}
                            onChange={(e) => handleChange(e, "email")}
                            placeholder="Confirm email" />
                        <button onClick={updateEmail} disabled={!isEditor}>Update</button>


                    </div>
                    <div className={styles.block}>
                        <h3>Change password</h3>
                        <button onClick={requestPasswordChange} disabled={!isEditor}>Request change</button>

                    </div>

                </div>
                <div >
                    <h2>Color palette</h2>
                    <div className={styles.block}> 
                        <h3>Main color</h3>
                        <input
                            type="color"
                            name="main"
                            value={colorsData.main || "#fff"}
                            onChange={(e) => handleChange(e, "colors")}
                        />

                        <h3>Secondary color</h3>
                        <input
                            name="secondary"
                            value={colorsData.secondary || "#fff"}
                            onChange={(e) => handleChange(e, "colors")}
                            type="color"
                        />

                        <h3>Table header color</h3>
                        <input
                            name="table_header"
                            value={colorsData.table_header || "#fff"}
                            onChange={(e) => handleChange(e, "colors")}
                            type="color"
                        />
                        <button onClick={updateColors}>Update</button>
                    </div>
                </div>
            </div>

        </div>
    )
}

export default Atualizar;