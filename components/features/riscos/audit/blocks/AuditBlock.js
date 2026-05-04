import { useEffect } from "react";
import { useState } from "react";
import { handleReq } from "../../../../../functions/crud_s";
import { getTextColor } from "../../../../../functions/colors";
import Inputs from "../forms/Inputs";
import usePerm from "../../../../../hooks/usePerm";
import { useAudit } from "../data/AuditContext";
import useAuth from "../../../../../hooks/useAuth";
import styles from '../../../../../styles/modules/risco.module.css'
import { calculateRowSpan } from "../../../../../functions/general";

const AuditBlock = ({audit, index, updatingRisk, 
    setUpdatingRisk, setExibirModal, 
    seeArea, setSeeArea, setConfirmDeleteItem}) => {
    const [novosDados, setNovosDados] = useState({});
    const [isBeingUpdated, setIsBeingUpdated] = useState(false);
    const { audits, setIsLoading, fetchData } = useAudit();
    const {isEditor} = usePerm();
    const {token} = useAuth();

    useEffect(() => {
        setNovosDados({
            id: audit?.id,
            risk_id: audit?.risk?.id,
            response: audit?.response,
            impact: audit?.impact,
            action: audit?.action,
            urgency: audit?.urgency,
            financial_impact: audit?.financial_impact,
            schedule_impact: audit?.schedule_impact,
            impact_description: audit?.impact_description,
            evaluation_description: audit?.evaluation_description
        })
    }, []);

    const enviar = async () => {
        setIsLoading(true);
        try {
            await handleReq({
                table: 'risk_audit',
                route: 'update',
                token,
                data: novosDados,
                fetchData
            });
        } catch (error) {
            console.error("Update failed:", error);
        }
        setUpdatingRisk(null);
        setIsBeingUpdated();
        setIsLoading(false);
    };

    const { risk } = audit;
    const { wbs_item } = risk ?? {};
    const { wbs_area } = wbs_item ?? {};

    const shouldMergeArea = wbs_area?.id === audits[index - 1]?.risk?.wbs_item?.wbs_area?.id;
    const shouldMergeItem = wbs_item?.id === audits[index - 1]?.risk?.wbs_item?.id;
    const shouldMergeRisk = risk?.id === audits[index - 1]?.risk?.id;

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
                    backgroundColor={wbs_area?.color}
                    seeArea={seeArea}
                />
            ) : (
                <tr style={{ backgroundColor: wbs_area?.color || 'white', color: getTextColor(wbs_area?.color ?? "#ffffff") }}>
                    {seeArea && (
                        <>
                            {!shouldMergeArea ? (
                                <td rowSpan={calculateRowSpan(audits, wbs_area?.id, index, 'risk.wbs_item.wbs_area.id')}
                                >{wbs_area?.name || "Others"}</td>
                            ) : null}
                            {!shouldMergeItem ? (
                                <td rowSpan={calculateRowSpan(audits, wbs_item?.id, index, 'risk.wbs_item.id')}
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
                    <td className={styles.auditTdText}>{audit.impact_description}</td>
                    <td className={styles.auditTdComparacao}>
                        Plan: R${Number(audit?.risk?.risk_analysis[0]?.financial_impact || '0').toFixed(2)}<br />
                        Actual: R${Number(audit.financial_impact).toFixed(2)}
                    </td>
                    <td className={styles.auditTdComparacao}>
                        Plan: <br />{audit?.risk?.risk_analysis[0]?.schedule_impact || '-'} days<br />
                        Actual: <br />{audit.schedule_impact} days
                    </td>
                    <td className={styles.auditTdText}>{audit.response}</td>
                    <td className={styles.auditTdComparacao}>
                        Plan: {audit?.risk?.risk_analysis[0]?.impact || '-'}<br />
                        Actual: {audit.impact}<br />
                    </td>
                    <td className={styles.auditTdComparacao}>
                        Plan: {audit?.risk?.risk_analysis[0]?.action || '-'}<br />
                        Actual: {audit.action}<br />
                    </td>
                    <td className={styles.auditTdComparacao}>
                        Plan: {audit?.risk?.risk_analysis[0]?.urgency || '-'}<br />
                        Actual: {audit.urgency}<br />
                    </td>
                    <td className={styles.auditTdText}>{audit.evaluation_description}</td>
                    <td className='botoes_acoes'>
                        <button onClick={() => setConfirmDeleteItem(audit)} disabled={!isEditor}>❌</button>
                        <button onClick={() => {
                            setIsBeingUpdated(audit.id); setUpdatingRisk(audit?.risk?.id)
                        }
                        } disabled={!isEditor}>⚙️</button>
                    </td>
                </tr>
            )}
        </>
    )
};

export default AuditBlock;