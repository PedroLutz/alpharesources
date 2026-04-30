import React, { useEffect, useState } from "react"
import styles from '../../../../styles/modules/risco.module.css'
import CadastroInputs from "./forms/Inputs";
import Modal from "../../../ui/Modal";
import Loading from "../../../ui/Loading";
import { handleReq, handleFetch } from "../../../../functions/crud_s";
import { cleanForm } from "../../../../functions/general";
import useAuth from "../../../../hooks/useAuth";
import usePerm from "../../../../hooks/usePerm";
import HelpBubble from "../../../ui/HelpBubble/risco/Analise";
import { getTextColor } from "../../../../functions/colors";
import { AnaliseProvider, useAnalise } from "./data/AnaliseContext";
import NewAnaliseCreator from "./forms/NewAnaliseCreator";
import AnaliseBlock from "./blocks/AnaliseBlock";
import AssessmentMatrix from "./blocks/AssessmentMatrix";

const modalLabels = {
    'inputsVazios': 'Fill out all fields before adding new data!',
    'deleteSuccess': 'Deletion Successful!',
    'deleteFail': 'Deletion Failed!',
    'valorNegativo': 'No fields can have negative values!',
    'maiorQueCinco': 'Classifications must be between 1 and 5!',
    'riscoRepetido': 'You have already analysed this risk!'
};

const TabelaAnalise = () => {
    const { token } = useAuth();
    const { isEditor } = usePerm();

    const { analises, isLoading, setIsLoading, fetchData } = useAnalise();
    const [confirmDeleteItem, setConfirmDeleteItem] = useState(null);
    const [exibirModal, setExibirModal] = useState(null);
    const [updatingLine, setUpdatingLine] = useState(false);
    const [seeArea, setSeeArea] = useState(false);
    const [showHelp, setShowHelp] = useState(false);

    const handleConfirmDelete = async () => {
        if (confirmDeleteItem) {
            await handleReq({
                table: "risk_analysis",
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
            <h2 className="smallTitle">Risk Analysis <button onClick={() => setShowHelp(true)}>❔</button></h2>
            <button className="botao-bonito" style={{ marginBottom: '1rem', width: 'fit-content' }}
                onClick={() => { !updatingLine && setSeeArea(!seeArea) }}
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
                    <table className={`${styles.tabelaAnalise} tabela`}>
                        <thead>
                            <tr>
                                {seeArea && (
                                    <>
                                        <th>Area</th>
                                        <th>Item</th>
                                    </>
                                )}
                                <th className={styles.analiseRiskTd} style={{ width: '10rem' }}>Risk</th>
                                <th>Occurrence</th>
                                <th>Impact</th>
                                <th>Action</th>
                                <th>Urgency</th>
                                <th>RPN</th>
                                <th>Financial Impact</th>
                                <th>Estimated Monetary Value</th>
                                <th>Schedule Impact</th>
                                <th>Estimated Time Impact</th>
                                <th className={styles.optionsTh}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {analises.map((analise, index) => (
                                <AnaliseBlock
                                    key={analise.id}
                                    index={index}
                                    analise={analise}
                                    updatingLine={updatingLine}
                                    setUpdatingLine={setUpdatingLine}
                                    seeArea={seeArea}
                                    setSeeArea={setSeeArea}
                                    setExibirModal={setExibirModal}
                                    setConfirmDeleteItem={setConfirmDeleteItem}
                                />
                            ))}
                            <NewAnaliseCreator
                                seeArea={seeArea}
                                setExibirModal={setExibirModal}
                            />
                        </tbody>
                    </table>
                </div>
            </div>
            <AssessmentMatrix/>
        </div>
    )
};

const Main = () => {
    return (
        <AnaliseProvider>
            <TabelaAnalise />
        </AnaliseProvider>
    )
};

export default Main; 