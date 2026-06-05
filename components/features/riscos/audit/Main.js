import React, { useEffect, useState } from "react"
import styles from '../../../../styles/modules/risco.module.css'
import CadastroInputs from "./forms/Inputs";
import Modal from "../../../ui/Modal";
import Loading from "../../../ui/Loading";
import { handleReq, handleFetch } from "../../../../functions/crud_s";
import { cleanForm } from "../../../../functions/general";
import usePerm from "../../../../hooks/usePerm";
import useAuth from "../../../../hooks/useAuth";
import HelpBubble from "../../../ui/HelpBubble/risco/Audit";
import { getTextColor } from "../../../../functions/colors";
import { AuditProvider, useAudit } from "./data/AuditContext";
import NewAuditCreator from "./forms/NewAuditCreator";
import AuditBlock from "./blocks/AuditBlock";
import { useCallback } from "react";
import exportCSV from "../../../../functions/exportCsv";
import { useToolbar } from "../../../../hooks/useToolbar";

const modalLabels = {
    'inputsVazios': 'Fill out all fields before adding new data!',
    'deleteSuccess': 'Deletion Successful!',
    'deleteFail': 'Deletion Failed!',
    'valorNegativo': 'No fields can have negative values!',
    'maiorQueCinco': 'Classifications must be between 1 and 5!'
};

const TabelaAudit = () => {
    const { isEditor } = usePerm();
    const { user, token } = useAuth();
    const user_id = user.id;

    const [confirmDeleteItem, setConfirmDeleteItem] = useState(null);
    const { audits, isLoading, setIsLoading, fetchData } = useAudit();
    const [exibirModal, setExibirModal] = useState(null);
    const [updatingRisk, setUpdatingRisk] = useState(null);
    const [seeArea, setSeeArea] = useState(false);
    const [showHelp, setShowHelp] = useState(false);

    const { setExportCSVClick, setHelpClick } = useToolbar();

    const exportToCSV = useCallback(() => {
            const headers = ["Area", "Item", 
                "Risk", "Impact description", "Financial impact", 
                "Schedule impact", "Response", "Impact", "Action", 
                "Urgency", "Evalutaion description"];
            const lines = audits.map(analise => {
    
                const { risk } = audit;
                const { wbs_item } = risk ?? {};
                const { wbs_area } = wbs_item ?? {};

                const shouldMergeArea = wbs_area?.id === audits[index - 1]?.risk?.wbs_item?.wbs_area?.id;
                const shouldMergeItem = wbs_item?.id === audits[index - 1]?.risk?.wbs_item?.id;
                const shouldMergeRisk = risk?.id === audits[index - 1]?.risk?.id;
    
                return [
                    `"${wbs_area?.name || "Others"}"`,
                    `"${wbs_item?.name || "Others"}"`,
                    `"${risk?.risk}"`,
                    `"${audit.impact_description}"`,
                    `"Plan: R$${Number(audit?.risk?.risk_analysis[0]?.financial_impact || '0').toFixed(2)},
                        Actual: R$${Number(audit.financial_impact).toFixed(2)}}"`,
                    `"Plan: ${audit?.risk?.risk_analysis[0]?.schedule_impact || '-'} days,
                        Actual: ${audit.schedule_impact} days"`,
                    `"${audit.response}"`,
                    `"Plan: ${audit?.risk?.risk_analysis[0]?.impact || '-'},
                        Actual: ${audit.impact}}"`,
                    `"Plan: ${audit?.risk?.risk_analysis[0]?.action || '-'},
                        Actual: ${audit.action}"`,
                    `"Plan: ${audit?.risk?.risk_analysis[0]?.urgency || '-'},
                        Actual: ${audit.urgency}"`,
                    `"${audit.evaluation_description}"`,
                ]
            });
            exportCSV(headers, lines, "risk_audit");
        }, [audits, exportCSV]);
    
        useEffect(() => {
            setHelpClick(() => () => setShowHelp(true));
            setExportCSVClick(() => exportToCSV);
    
            return (() => {
                setHelpClick(null);
                setExportCSVClick(null);
            })
        }, [audits, exportToCSV]);

    const handleConfirmDelete = async () => {
        if (confirmDeleteItem) {
            await handleReq({
                table: "risk_audit",
                route: 'delete',
                token,
                data: { id: confirmDeleteItem.id },
                fetchData
            });
        }
        setExibirModal("deleteSuccess");
        setConfirmDeleteItem(null)
    };

    return (
        <div className="centered-container">
            {isLoading && <Loading />}
            {showHelp && <HelpBubble setShowHelp={setShowHelp} />}
            <h2 className="smallTitle">Risk Audit <button onClick={() => setShowHelp(true)}>❔</button></h2>
            <button className="botao-bonito" style={{ marginBottom: '1rem', width: 'fit-content' }}
                onClick={() => { !updatingRisk && setSeeArea(!seeArea) }}
            >See areas and items</button>
            {exibirModal != null && (
                <Modal objeto={{
                    titulo: modalLabels[exibirModal],
                    botao1: {
                        funcao: () => setExibirModal(null), texto: 'Okay'
                    },
                }} />
            )}

            {confirmDeleteItem && (
                <Modal objeto={{
                    titulo: `Are you sure you want to PERMANENTLY delete "${confirmDeleteItem?.risk?.risk}"?`,
                    alerta: true,
                    botao1: {
                        funcao: handleConfirmDelete, texto: 'Confirm'
                    },
                    botao2: {
                        funcao: () => setConfirmDeleteItem(null), texto: 'Cancel'
                    }
                }} />
            )}

            <div className={styles.tabelaRisco_container}>
                <div className={styles.tabelaRisco_wrapper}>
                    <table className={`${styles.tabelaAudit} tabela`}>
                        <thead>
                            <tr>
                                {seeArea && (
                                    <>
                                        <th>Area</th>
                                        <th>Item</th>
                                    </>
                                )}
                                <th>Risk</th>
                                <th>Impact description</th>
                                <th className={styles.auditThImpacto}>Financial impact</th>
                                <th className={styles.auditThImpacto}>Schedule impact</th>
                                <th>Response</th>
                                <th>Impact</th>
                                <th>Action</th>
                                <th>Urgency</th>
                                <th>Evaluation description</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>

                            {audits.map((audit, index) => (
                                <AuditBlock
                                    key={audit.id}
                                    audit={audit}
                                    index={index}
                                    updatingRisk={updatingRisk}
                                    setUpdatingRisk={setUpdatingRisk}
                                    seeArea={seeArea}
                                    setSeeArea={setSeeArea}
                                    setExibirModal={setExibirModal}
                                    setConfirmDeleteItem={setConfirmDeleteItem}
                                />
                            ))}
                            <NewAuditCreator
                                setExibirModal={setExibirModal}
                                seeArea={seeArea}
                            />
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
};

const Main = () => {
    return (
        <AuditProvider>
            <TabelaAudit/>
        </AuditProvider>
    )
};

export default Main;