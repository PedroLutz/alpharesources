import React, { useEffect, useState } from "react"
import styles from '../../../../styles/modules/risco.module.css'
import Modal from "../../../ui/Modal";
import Loading from "../../../ui/Loading";
import { handleReq } from "../../../../functions/crud_s";
import { cleanForm } from "../../../../functions/general";
import useAuth from "../../../../hooks/useAuth";
import usePerm from "../../../../hooks/usePerm";
import HelpBubble from "../../../ui/HelpBubble/risco/Resposta";
import { RespostaProvider, useResposta } from "./data/RespostaContext";
import NewRespostaCreator from "./forms/NewRespostaCreator";
import RespostaBlock, { capitalizeFirstLetter } from "./blocks/RespostaBlock";
import { useToolbar } from "../../../../hooks/useToolbar";
import { useCallback } from "react";
import exportCSV from "../../../../functions/exportCSV";

const modalLabels = {
    'inputsVazios': 'Fill out all fields before adding new data!',
    'deleteSuccess': 'Deletion Successful!',
    'deleteFail': 'Deletion Failed!',
};

const TabelaPlanos = () => {
    const { token } = useAuth();
    const { isEditor } = usePerm();

    const { respostas, isLoading, setIsLoading, fetchData } = useResposta();

    const [confirmDeleteItem, setConfirmDeleteItem] = useState(null);
    const [exibirModal, setExibirModal] = useState(null);
    const [updatingRisk, setUpdatingRisk] = useState(false);
    const [seeArea, setSeeArea] = useState(false);
    const [showHelp, setShowHelp] = useState(false);

    const { setExportCSVClick, setHelpClick } = useToolbar();

    const exportToCSV = useCallback(() => {
        const headers = ["Area", "Item", "Risk", "Strategy", "Response"];
        const lines = respostas.map(resposta => {
            const { risk } = resposta;
            const { wbs_item } = risk ?? {};
            const { wbs_area } = wbs_item ?? {};

            return [
                `"${wbs_area?.name || "Others"}"`,
                `"${wbs_item?.name || 'Others'}"`,
                `"${risk.risk}"`,
                `"${capitalizeFirstLetter(resposta.strategy)}"`,
                `"${resposta.details}"`,
            ]
        });
        exportCSV(headers, lines, "risk_response");
    }, [respostas, exportCSV]);

    useEffect(() => {
        setHelpClick(() => () => setShowHelp(true));
        setExportCSVClick(() => exportToCSV);

        return (() => {
            setHelpClick(null);
            setExportCSVClick(null);
        })
    }, [respostas, exportToCSV]);

    const handleConfirmDelete = async () => {
        if (confirmDeleteItem) {
            await handleReq({
                table: "risk_response",
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
            <h2 className="smallTitle">Risk Response Planning</h2>
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
                    titulo: `Are you sure you want to PERMANENTLY delete the response for "${confirmDeleteItem?.risk?.risk}"?`,
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
                    <table className={`${styles.tabelaPlano} tabela`}>
                        <thead>
                            <tr>
                                {seeArea && (
                                    <>
                                        <th>Area</th>
                                        <th>Item</th>
                                    </>
                                )}
                                <th>Risk</th>
                                <th>Strategy</th>
                                <th>Response</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {respostas.map((resposta, index) => (
                                <RespostaBlock
                                    key={resposta.id}
                                    resposta={resposta}
                                    index={index}
                                    updatingRisk={updatingRisk}
                                    setUpdatingRisk={setUpdatingRisk}
                                    seeArea={seeArea}
                                    setSeeArea={setSeeArea}
                                    setExibirModal={setExibirModal}
                                    setConfirmDeleteItem={setConfirmDeleteItem}
                                />
                            ))}
                            <NewRespostaCreator
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
        <RespostaProvider>
            <TabelaPlanos />
        </RespostaProvider>
    )
};

export default Main;