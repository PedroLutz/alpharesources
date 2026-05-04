import { useState, useEffect } from "react";
import { useResposta } from "../data/RespostaContext";
import { handleReq } from "../../../../../functions/crud_s";
import Inputs from "../forms/Inputs";
import { getTextColor } from "../../../../../functions/colors";
import styles from '../../../../../styles/modules/risco.module.css'
import usePerm from "../../../../../hooks/usePerm";
import useAuth from "../../../../../hooks/useAuth";
import { calculateRowSpan } from "../../../../../functions/general";

function capitalizeFirstLetter(str) {
    if (typeof str !== 'string' || str.length === 0) {
        return str;
    }
    return str.charAt(0).toUpperCase() + str.slice(1);
}

const RespostaBlock = ({ resposta, index, updatingRisk, setUpdatingRisk, seeArea, setSeeArea, setExibirModal, setConfirmDeleteItem }) => {
    const [novosDados, setNovosDados] = useState({});
    const [isBeingUpdated, setIsBeingUpdated] = useState(false);
    const { respostas, setIsLoading, fetchData } = useResposta();
    const {isEditor} = usePerm();
    const {token} = useAuth();

    useEffect(() => {
        setNovosDados({
            id: resposta.id,
            risk_id: resposta.risk.id,
            strategy: resposta.strategy,
            details: resposta.details,
        })
    }, []);

    const enviar = async () => {
        setIsLoading(true);
        try {
            await handleReq({
                table: 'risk_response',
                route: 'update',
                token,
                data: novosDados,
                fetchData
            });
        } catch (error) {
            console.error("Update failed:", error);
        }
        setUpdatingRisk(null);
        setIsBeingUpdated(false);
        setIsLoading(false);
    };

    const { risk } = resposta;
    const { wbs_item } = risk ?? {};
    const { wbs_area } = wbs_item ?? {};

    const shouldMergeArea = wbs_area?.id === respostas[index - 1]?.risk?.wbs_item?.wbs_area?.id;
    const shouldMergeItem = wbs_item?.id === respostas[index - 1]?.risk?.wbs_item?.id;
    const shouldMergeRisk = risk?.id === respostas[index - 1]?.risk?.id;

    return (
        <>
            {isBeingUpdated ? (
                <Inputs tipo="update"
                    obj={novosDados}
                    objSetter={setNovosDados}
                    funcoes={{
                        enviar,
                        cancelar: () => { setIsBeingUpdated(false); setUpdatingRisk(null) }
                    }}
                    setExibirModal={setExibirModal}
                    seeArea={seeArea}
                    backgroundColor={wbs_area?.color}
                />
            ) : (
                <tr style={{ backgroundColor: wbs_area?.color || 'white', color: getTextColor(wbs_area?.color ?? "#ffffff") }}>
                    {seeArea && (
                        <>
                            {!shouldMergeArea ? (
                                <td rowSpan={calculateRowSpan(respostas, wbs_area?.id, index, 'risk.wbs_item.wbs_area.id')}
                                >{wbs_area?.name || "Others"}</td>
                            ) : null}
                            {!shouldMergeItem ? (
                                <td rowSpan={calculateRowSpan(respostas, wbs_item?.id, index, 'risk.wbs_item.id')}
                                >{wbs_item?.name || "Others"}</td>
                            ) : null}
                        </>
                    )}
                    {!updatingRisk || updatingRisk !== resposta?.risk?.id ? (
                        <>
                            {!shouldMergeRisk ? (
                                <td rowSpan={calculateRowSpan(respostas, resposta?.risk?.id, index, "risk.id")}
                                >{risk?.risk}</td>
                            ) : null}
                        </>
                    ) : (
                        <td>{risk?.risk}</td>
                    )}
                    <td>{capitalizeFirstLetter(resposta.strategy)}</td>
                    <td className={styles.planoTdResponse}>{resposta.details}</td>
                    <td className='botoes_acoes'>
                        <button onClick={() => setConfirmDeleteItem(resposta)} disabled={!isEditor}>❌</button>
                        <button onClick={() => {
                            setIsBeingUpdated(true); setUpdatingRisk(resposta?.risk?.id); setSeeArea(false)
                        }
                        } disabled={!isEditor}>⚙️</button>
                    </td>
                </tr>
            )}
        </>
    )
};

export default RespostaBlock;