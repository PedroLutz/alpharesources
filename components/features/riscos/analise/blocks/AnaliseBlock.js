import { useState } from "react";
import { handleReq } from "../../../../../functions/crud_s";
import { useEffect } from "react";
import { useAnalise } from "../data/AnaliseContext";
import CadastroInputs from "../forms/Inputs";
import styles from '../../../../../styles/modules/risco.module.css'
import useAuth from "../../../../../hooks/useAuth";
import usePerm from "../../../../../hooks/usePerm";
import { getTextColor } from "../../../../../functions/colors";
import { calculateRowSpan } from "../../../../../functions/general";

const camposVazios = {
    risk_id: "",
    occurrence: "",
    action: "",
    urgency: "",
    impact: "",
    financial_impact: "",
    schedule_impact: ""
}

const AnaliseBlock = ({ analise, index,
    updatingLine, setUpdatingLine, seeArea, setSeeArea,
    setExibirModal, setConfirmDeleteItem }) => {
    const [novosDados, setNovosDados] = useState(camposVazios);
    const [isBeingUpdated, setIsBeingUpdated] = useState(false);
    const { analises, fetchData, setIsLoading } = useAnalise();
    const {token} = useAuth();
    const {isEditor} = usePerm();

    useEffect(() => {
        setNovosDados({
            id: analise.id,
            risk_id: analise.risk.id,
            action: analise.action,
            occurrence: analise.occurrence,
            urgency: analise.urgency,
            impact: analise.impact,
            financial_impact: analise.financial_impact,
            schedule_impact: analise.schedule_impact
        })
    }, [])

    const enviar = async () => {
        setIsLoading(true);
        try {
            await handleReq({
                table: 'risk_analysis',
                route: 'update',
                token,
                data: novosDados,
                fetchData
            });
        } catch (error) {
            console.error("Update failed:", error);
        }
        setUpdatingLine(null);
        setIsBeingUpdated(false);
        setIsLoading(false);
    };

    const calculaRPN = (item) => {
        return item.occurrence * item.impact * item.action * item.urgency;
    }

    const { risk } = analise;
    const { wbs_item } = risk ?? {};
    const { wbs_area } = wbs_item ?? {};

    const shouldMergeArea = wbs_area?.id === analises[index - 1]?.risk?.wbs_item?.wbs_area?.id;
    const shouldMergeItem = wbs_item?.id === analises[index - 1]?.risk?.wbs_item?.id;


    const shouldMergeRisk = risk?.id === analises[index - 1]?.risk?.id;

    const riskPriorityNumber = calculaRPN(analise);
    const rpnBackgroundColor = riskPriorityNumber >= 150 ? '#f7b2b2' : 
        (riskPriorityNumber >= 50 ? '#f7dcb2' : '#d2f5c6');

    const financialImpact = analise?.financial_impact ?? 0;
    const financialImpactLabel = financialImpact != 0 ? `R$${financialImpact.toFixed(2)}` : '-';
    const emv = ((financialImpact ?? 0) * (analise.occurrence / 5)).toFixed(2);

    const scheduleImpact = analise?.schedule_impact;
    const hasScheduleImpact = scheduleImpact != 0 && scheduleImpact != null;
    const scheduleImpactLabel = hasScheduleImpact ? `${scheduleImpact} days` : '-';
    const eti = hasScheduleImpact ? `${(scheduleImpact * (analise.occurrence / 5)).toFixed()} days` : '-';

    return (
        <>
            {isBeingUpdated ? (
                <CadastroInputs tipo="update"
                    obj={novosDados}
                    objSetter={setNovosDados}
                    funcoes={{
                        enviar,
                        cancelar: () => { setIsBeingUpdated(false); setUpdatingLine(null) },
                    }}
                    setExibirModal={setExibirModal}
                    seeArea={seeArea}
                    backgroundColor={wbs_area?.color}
                />
            ) : (
                <tr style={{ backgroundColor: wbs_area?.color, color: getTextColor(wbs_area?.color ?? "#ffffff") }}>
                    {seeArea && (
                        <>
                            {!shouldMergeArea ? (
                                <td rowSpan={calculateRowSpan(analises, wbs_area?.id, index, 'risk.wbs_item.wbs_area.id')}
                                >{wbs_area?.name || "Others"}</td>
                            ) : null}
                            {!shouldMergeItem ? (
                                <td rowSpan={calculateRowSpan(analises, wbs_item?.id, index, 'risk.wbs_item.id')}
                                >{wbs_item?.name || "Others"}</td>
                            ) : null}
                        </>
                    )}
                    {!updatingLine || updatingLine !== risk?.risk ? (
                        <>
                            {!shouldMergeRisk ? (
                                <td className={styles.riskTd} rowSpan={calculateRowSpan(risk?.risk, index, 'risk.risk')}
                                >{risk?.risk}</td>
                            ) : null}
                        </>
                    ) : (
                        <td className={styles.analiseRiskTd}>{risk?.risk}</td>
                    )}
                    <td className={styles.analiseOcurrenceTd}>{analise.occurrence}</td>
                    <td>{analise.impact}</td>
                    <td>{analise.action}</td>
                    <td>{analise.urgency}</td>
                    <td style={{ backgroundColor: rpnBackgroundColor }}>{riskPriorityNumber}</td>
                    <td>{financialImpactLabel}</td>
                    <td>R${emv}</td>
                    <td>{scheduleImpactLabel}</td>
                    <td>{eti}</td>
                    <td className='botoes_acoes'>
                        <button onClick={() => setConfirmDeleteItem(analise)} disabled={!isEditor}>❌</button>
                        <button onClick={() => {
                            setIsBeingUpdated(analise.id); setUpdatingLine(analise?.risk?.risk); setSeeArea(false)
                        }
                        } disabled={!isEditor}>⚙️</button>
                    </td>
                </tr>
            )}
        </>
    )
};

export default AnaliseBlock;