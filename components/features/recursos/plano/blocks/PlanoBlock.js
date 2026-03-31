import { useState, useEffect } from "react";
import useAuth from "../../../../../hooks/useAuth";
import usePerm from "../../../../../hooks/usePerm";
import { usePlano } from "../data/PlanoProvider";
import { getTextColor } from "../../../../../functions/colors";
import CadastroInputs from "../forms/CadastroInputs";
import { isoDateToEuDate } from "../../../../../functions/general";
import styles from '../../../../../styles/modules/planoAquisicao.module.css'
import { handleReq } from "../../../../../functions/crud_s";

const methodLabels = {
    purchase: 'Purchase',
    rental: 'Rental',
    borrowing: "Borrowing",
    outsourcing: "Outsourcing",
}

const PlanoBlock = ({ plano, index, updatingLine, setUpdatingLine, setExibirModal, setConfirmDeleteItem }) => {
    const { planos, refetchData, setIsLoading } = usePlano();
    const { token } = useAuth();
    const { isEditor } = usePerm();
    const [novosDados, setNovosDados] = useState({});
    const [isBeingEdited, setIsBeingEdited] = useState(false);

    useEffect(() => {
        setNovosDados(plano);
    }, []);

    const enviar = async (obj) => {
        setIsLoading(true);
        const { date_diference, value_diference, resource, ...usedObj } = obj;
        try {
            await handleReq({
                table: 'resource_acquisition_plan',
                route: 'update',
                token,
                data: usedObj,
                fetchData: refetchData
            });
        } catch (error) {
            console.error("Update failed:", error);
            throw Error("Update failed:", error);
        }
        setIsLoading(false);
        setUpdatingLine(false);
        setIsBeingEdited(false);
    };

    const backgroundColor = plano?.resource?.wbs_item?.wbs_area?.color;

    const date_real = plano.date_real != 'NaN/NaN/NaN' && plano.date_real != null ? isoDateToEuDate(plano.date_real) : '-';
    const value_real = plano.value_real != null ? `R$${Number(plano.value_real).toFixed(2)}` : '-';

    const isEditingThisResource = updatingLine && updatingLine === plano.resource.resource;

    const calculateRowSpan = (currentArea, currentIndex) => {
        let rowSpan = 1;
        for (let i = currentIndex + 1; i < planos.length; i++) {
            if (planos[i].resource.resource === currentArea) {
                rowSpan++;
            } else {
                break;
            }
        }
        return rowSpan;
    };

    return (
        <>
            {isBeingEdited ? (
                <CadastroInputs tipo="update"
                    obj={novosDados}
                    objSetter={setNovosDados}
                    funcoes={{
                        enviar,
                        cancelar: () => { setIsBeingEdited(false); setUpdatingLine(null) }
                    }}
                    setExibirModal={setExibirModal}
                />
            ) : (
                <tr style={{ backgroundColor, color: getTextColor(backgroundColor ?? '#ffffff') }}>
                    {!isEditingThisResource ? (
                        <>
                            {index === 0 || planos[index - 1].resource.resource !== plano.resource.resource ? (
                                <td rowSpan={calculateRowSpan(plano.resource.resource, index)}
                                >{plano.resource.resource}</td>
                            ) : null}
                        </>
                    ) : (
                        <td>{plano.resource.resource}</td>
                    )}
                    <td>{methodLabels[plano.method_a]}</td>
                    <td>{plano.plan_a}</td>
                    <td>{plano.details_a}</td>
                    <td>R${Number(plano.value_a).toFixed(2)}</td>
                    <td>{isoDateToEuDate(plano.expected_date)}</td>
                    <td id={styles.tdCriticalDate}>{isoDateToEuDate(plano.critical_date)}</td>
                    <td>{methodLabels[plano.method_b]}</td>
                    <td>{plano.plan_b}</td>
                    <td>{plano.details_b}</td>
                    <td>R${Number(plano.value_b).toFixed(2)}</td>
                    <td>{plano.plan_real || '-'}</td>
                    <td>{date_real}</td>
                    <td>{value_real}</td>
                    <td>{plano.date_diference}</td>
                    <td>{plano.value_diference}
                    </td>
                    <td className='botoes_acoes'>
                        <button onClick={() => setConfirmDeleteItem(plano)}
                            disabled={!isEditor}>❌</button>
                        <button onClick={() => {
                            setIsBeingEdited(true);
                            setUpdatingLine(plano.resource.resource);
                        }
                        } disabled={!isEditor}>⚙️</button>
                    </td>
                </tr>
            )}
        </>
    )
};

export default PlanoBlock;