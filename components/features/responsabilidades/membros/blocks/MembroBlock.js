import CadastroInputs from "../forms/CadastroInputs";
import useAuth from "../../../../../hooks/useAuth";
import usePerm from "../../../../../hooks/usePerm";
import { handleReq } from "../../../../../functions/crud_s";
import styles from '../../../../../styles/modules/responsabilidades.module.css'
import { useMembro } from "../data/MembroContext";
import { useState } from "react";
import { useEffect } from "react";

const MembroBlock = ({ membro, setExibirModal, setConfirmDeleteItem }) => {
    const { isEditor } = usePerm();
    const { token } = useAuth();
    const { setIsLoading, fetchData } = useMembro();
    const [novosDados, setNovosDados] = useState(membro);
    const [isBeingUpdated, setIsBeingUpdated] = useState(false);

    useEffect(() => {
        setNovosDados(membro);
    }, [membro]);

    const enviar = async () => {
        setIsLoading(true);
        try {
            await handleReq({
                table: 'member',
                route: 'update',
                token,
                data: novosDados,
                fetchData
            });
        } catch (error) {
            console.error("Update failed:", error);
        } finally {
            setIsLoading(false);
            setIsBeingUpdated(false);
        }
    };

    return (
        <>
            {isBeingUpdated ? (
                <CadastroInputs
                    obj={novosDados}
                    objSetter={setNovosDados}
                    tipo="update"
                    setExibirModal={setExibirModal}
                    funcoes={{
                        enviar,
                        cancelar: () => setIsBeingUpdated(false)
                    }}
                />
            ) : (
                <div className={styles.membrosContainer}>
                    <div className={styles.membrosConteudo}>
                        <b>Name:</b> {membro.name}
                    </div>
                    <div className={styles.membrosConteudo}>
                        <b>Softskills:</b> {membro.softskills}
                    </div>
                    <div className={styles.membrosConteudo}>
                        <b>Hardskills:</b> {membro.hardskills}
                    </div>
                    <div className={styles.membrosBotoesAcoes}>
                        <button onClick={() => setConfirmDeleteItem(membro)}
                            disabled={!isEditor}>❌</button>
                        <button onClick={() => {
                            setIsBeingUpdated(true)
                        }} disabled={!isEditor}>⚙️</button>
                    </div>
                </div>
            )}
        </>
    )
};

export default MembroBlock;