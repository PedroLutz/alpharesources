import { useEffect } from "react";
import { useState } from "react";
import { handleReq } from "../../../../../functions/crud_s";
import { useImpacto } from "../data/ImpactoContext";
import { getTextColor } from "../../../../../functions/colors";
import styles from '../../../../../styles/modules/risco.module.css'
import Inputs from "../forms/Inputs";
import useAuth from "../../../../../hooks/useAuth";
import usePerm from "../../../../../hooks/usePerm";
import { calculateRowSpan } from "../../../../../functions/general";

function capitalizeFirstLetter(str) {
    if (typeof str !== 'string' || str.length === 0) {
        return str;
    }
    return str.charAt(0).toUpperCase() + str.slice(1);
}

const ImpactoBlock = ({ impacto, index, updatingRisk, setUpdatingRisk, 
    seeArea, setSeeArea, setExibirModal, setConfirmDeleteItem }) => {
    const [novosDados, setNovosDados] = useState({});
    const { impactos, fetchData, setIsLoading } = useImpacto();
    const [isBeingUpdated, setIsBeingUpdated] = useState(false);
    const {token} = useAuth();
    const {isEditor} = usePerm();

    useEffect(() => {
        setNovosDados({
            id: impacto.id,
            risk_id: impacto.risk.id,
            impact_area: impacto.impact_area,
            score: impacto.score,
            description: impacto.description
        })
    }, []);

    const enviar = async () => {
        setIsLoading(true);
        try {
            await handleReq({
                table: 'risk_impact',
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

    const { risk } = impacto;
    const { wbs_item } = risk ?? {};
    const { wbs_area } = wbs_item ?? {};

    const shouldMergeArea = wbs_area?.id === impactos[index - 1]?.risk?.wbs_item?.wbs_area?.id;
    const shouldMergeItem = wbs_item?.id === impactos[index - 1]?.risk?.wbs_item?.id;
    const shouldMergeRisk = risk?.id === impactos[index - 1]?.risk?.id;

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
                                <td rowSpan={calculateRowSpan(impactos, wbs_area?.id, index, 'risk.wbs_item.wbs_area.id')}
                                >{wbs_area?.name || "Others"}</td>
                            ) : null}
                            {!shouldMergeItem ? (
                                <td rowSpan={calculateRowSpan(impactos, wbs_item?.id, index, 'risk.wbs_item.id')}
                                >{wbs_item?.name || "Others"}</td>
                            ) : null}
                        </>
                    )}
                    {!updatingRisk || updatingRisk !== risk?.id ? (
                        <>
                            {!shouldMergeRisk ? (
                                <td rowSpan={calculateRowSpan(risk?.id, index, "risk.id")}
                                >{risk?.risk}</td>
                            ) : null}
                        </>
                    ) : (
                        <td>{risk?.risk}</td>
                    )}
                    <td>{capitalizeFirstLetter(impacto.impact_area)}</td>
                    <td style={{ width: '3rem', textAlign: 'center' }}>{impacto.score}</td>
                    <td className={styles.impactoTdDescricao}>{impacto.description}</td>
                    <td className='botoes_acoes'>
                        <button onClick={() => setConfirmDeleteItem(impacto)} disabled={!isEditor}>❌</button>
                        <button onClick={() => {
                            setUpdatingRisk(impacto?.risk?.id); setIsBeingUpdated(true); setSeeArea(false);
                        }
                        } disabled={!isEditor}>⚙️</button>
                    </td>
                </tr>
            )}
        </>
    )
};

export default ImpactoBlock;