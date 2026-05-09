import { useEffect, useState } from "react";
import useAuth from "../../../../../hooks/useAuth";
import { useLicao } from "../data/LicaoContext";
import { handleReq } from "../../../../../functions/crud_s";
import usePerm from "../../../../../hooks/usePerm";
import { isoDateToEuDate } from "../../../../../functions/general";
import styles from '../../../../../styles/modules/monitoramento.module.css'
import Inputs from "../forms/Inputs";

const LicaoBlock = ({licao, setExibirModal, setConfirmDeleteItem}) => {
    const [novosDados, setNovosDados] = useState({});
    const { token } = useAuth();
    const { fetchData, setIsLoading } = useLicao();
    const { isEditor } = usePerm();
    const [isBeingEdited, setIsBeingEdited] = useState(false);

    useEffect(() => {
        setNovosDados(licao);
    }, [])

    const enviar = async () => {
        setIsLoading(true);
        try {
            await handleReq({
                table: 'lesson',
                route: 'update',
                token,
                data: novosDados,
                fetchData
            });
        } catch (error) {
            console.error("Update failed:", error);
        }
        setIsBeingEdited(false);
        setIsLoading(false);
    };

    return (
        <>
            {isBeingEdited ? (
                <Inputs tipo="update"
                    obj={novosDados}
                    objSetter={setNovosDados}
                    funcoes={{
                        enviar,
                        cancelar: () => setIsBeingEdited(false)
                    }}
                    setExibirModal={setExibirModal}
                />
            ) : (
                <tr>
                    <td className={styles.licoesData}>{isoDateToEuDate(licao.date)}</td>
                    <td className={styles.licoesTipo}>{licao.type ? 'Explicit' : 'Tacit'}</td>
                    <td className={styles.licoesSituacao}>{licao.situation}</td>
                    <td className={styles.licoesAprendizado}>{licao.learning}</td>
                    <td className={styles.licoesAcao}>{licao.action}</td>
                    <td className='botoes_acoes'>
                        <button onClick={() => setConfirmDeleteItem(licao)} disabled={!isEditor}>❌</button>
                        <button onClick={() => {
                            setIsBeingEdited(true);
                        }
                        } disabled={!isEditor}>⚙️</button>
                    </td>
                </tr>
            )}
        </>
    )
};

export default LicaoBlock;