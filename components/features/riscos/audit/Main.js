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