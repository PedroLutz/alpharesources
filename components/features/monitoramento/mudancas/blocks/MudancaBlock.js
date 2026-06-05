import { useState } from "react";
import { useMudanca } from "../data/MudancaContext";
import { handleReq } from "../../../../../functions/crud_s";
import Inputs from "../forms/Inputs";
import useAuth from "../../../../../hooks/useAuth";
import usePerm from "../../../../../hooks/usePerm";
import { useEffect } from "react";
import styles from '../../../../../styles/modules/monitoramento.module.css'
import { isoDateToEuDate } from "../../../../../functions/general";

export const typeLabels = {
    corrective: 'Corrective Action',
    preventive: 'Preventive Action',
    repair: 'Defect Repair',
    update: 'Update'
}

export const statusLabels = {
    starting: 'Starting',
    progress: 'In progress',
    finalized: 'Finalized'
}

const MudancaBlock = ({mudanca, setExibirModal, setConfirmDeleteItem}) => {
    const [novosDados, setNovosDados] = useState({});
    const {token} = useAuth();
    const {isEditor} = usePerm();
    const [isBeingEdited, setIsBeingEdited] = useState(false);
    const { fetchData, setIsLoading } = useMudanca();

    useEffect(() => {
        const { wbs_area, ...obj } = mudanca;
        obj.area_id = mudanca?.wbs_area?.id ?? -1;

        setNovosDados(obj);
    }, [])

    const enviar = async () => {
        setIsLoading(true);
        try {
            await handleReq({
                table: 'change',
                route: 'update',
                token,
                data: {
                    ...novosDados,
                    area_id: novosDados.area_id == -1 ? null : novosDados.area_id
                },
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
                    <td className={styles.mudancasData}>{isoDateToEuDate(mudanca.date)}</td>
                    <td>{mudanca.wbs_area?.name || "Others"}</td>
                    <td>{typeLabels[mudanca.type]}</td>
                    <td>{mudanca.item}</td>
                    <td className={styles.mudancasMudanca}>{mudanca.change}</td>
                    <td className={styles.mudancasJustificativa}>{mudanca.reasoning}</td>
                    <td className={styles.mudancasImpacto}>{mudanca.impact}</td>
                    <td>{mudanca.is_approved ? 'Approved' : 'Rejected'}</td>
                    <td>{statusLabels[mudanca.status]}</td>
                    <td>{mudanca.responsible_request}</td>
                    <td>{mudanca.responsible_approval}</td>
                    <td className='botoes_acoes'>
                        <button onClick={() => setConfirmDeleteItem(mudanca)} disabled={!isEditor}>❌</button>
                        <button onClick={() => { setIsBeingEdited(true) } } disabled={!isEditor}>⚙️</button>
                    </td>
                </tr>
            )}
        </>
    )
};

export default MudancaBlock;