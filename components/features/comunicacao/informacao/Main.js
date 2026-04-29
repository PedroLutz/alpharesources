import React, { useEffect, useState } from "react"
import styles from '../../../../styles/modules/comunicacao.module.css'
import Inputs from "./forms/Inputs";
import Modal from "../../../ui/Modal";
import Loading from "../../../ui/Loading";
import { handleFetch, handleReq } from "../../../../functions/crud_s";
import usePerm from "../../../../hooks/usePerm";
import useAuth from "../../../../hooks/useAuth";
import { cleanForm } from "../../../../functions/general";
import Link from "next/link";
import HelpBubble from "../../../ui/HelpBubble/comunicacao/Informacao";
import { InformacaoProvider, useInformacao } from "./data/InformacaoContext";
import NewInformacaoCreator from "./forms/NewInformacaoCreator";
import InformacaoBlock from "./blocks/InformacaoBlock";

const modalLabels = {
    'inputsVazios': 'Fill out all fields before adding new data!',
    'deleteSuccess': 'Deletion Successful!',
    'deleteFail': 'Deletion Failed!',
    'stakeholderRepetido': 'You have already registered the information for this stakeholder!'
};

const Tabela = () => {
    const { isEditor } = usePerm();
    const { token } = useAuth();
    
    const { informacoes, setIsLoading, isLoading, fetchData } = useInformacao();
    
    const [confirmDeleteItem, setConfirmDeleteItem] = useState(null);
    const [exibirModal, setExibirModal] = useState(null);
    const [updatingLine, setUpdatingLine] = useState(false);
    const [showHelp, setShowHelp] = useState(false);

    //funcao que envia os dados para atualizacao no backend
    const handleConfirmDelete = async () => {
        setIsLoading(true);
        if (confirmDeleteItem) {
            await handleReq({
                table: "information",
                route: 'delete',
                token,
                data: { id: confirmDeleteItem.id },
                fetchData
            });
        }
        setExibirModal("deleteSuccess");
        setConfirmDeleteItem(null)
        setIsLoading(false);
    };

    let lastGroupId = null, lastStakeholderId = null;

    return (
        <div className="centered-container">
            {isLoading && <Loading />}
            {showHelp && <HelpBubble setShowHelp={setShowHelp} />}
            <h2 className="smallTitle">Communicated Information <button onClick={() => setShowHelp(true)}>❔</button></h2>

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
                    titulo: `Are you sure you want to PERMANENTLY delete the information for "${confirmDeleteItem?.stakeholder?.stakeholder}"?`,
                    alerta: true,
                    botao1: {
                        funcao: handleConfirmDelete, texto: 'Confirm'
                    },
                    botao2: {
                        funcao: () => setConfirmDeleteItem(null), texto: 'Cancel'
                    }
                }} />
            )}

            <div className={styles.tabelaComunicacao_container}>
                <div className={styles.tabelaComunicacao_wrapper}>
                    <table className={`${styles.tabelaInformacao} tabela`}>
                        <thead>
                            <tr>
                                <th>Stakeholder Group</th>
                                <th>Stakeholder</th>
                                <th className={styles.infoTdInfo}>Information</th>
                                <th>Method</th>
                                <th>Frequency</th>
                                <th>Channel</th>
                                <th>Responsible</th>
                                <th>Record *</th>
                                <th>Feedback *</th>
                                <th>Action taken *</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {informacoes.map((informacao, index) => (
                                <InformacaoBlock
                                    key={informacao.id}
                                    index={index}
                                    informacao={informacao}
                                    updatingLine={updatingLine}
                                    setUpdatingLine={setUpdatingLine}
                                    setConfirmDeleteItem={setConfirmDeleteItem}
                                    setExibirModal={setExibirModal}
                                    lastStakeholderId={lastStakeholderId}
                                    lastGroupId={lastGroupId}
                                />
                            ))}
                            <NewInformacaoCreator
                                setExibirModal={setExibirModal}
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
        <InformacaoProvider>
            <Tabela />
        </InformacaoProvider>
    )
}

export default Main;