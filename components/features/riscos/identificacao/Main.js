import React, { useState } from "react"
import styles from '../../../../styles/modules/risco.module.css'
import Modal from "../../../ui/Modal";
import Loading from "../../../ui/Loading";
import { handleReq } from "../../../../functions/crud_s";
import useAuth from "../../../../hooks/useAuth";
import HelpBubble from "../../../ui/HelpBubble/risco/Identificacao";
import { IdentificacaoProvider, useIdentificacao } from "./data/IdentificacaoContext";
import NewRiscoCreator from "./forms/NewRiscoCreator";
import IdentificacaoBlock from "./blocks/IdentificacaoBlock";

const TabelaRiscos = () => {
    const { token } = useAuth();

    const { riscos, isLoading, fetchData } = useIdentificacao();
    const [confirmDeleteItem, setConfirmDeleteItem] = useState(null);
    const [exibirModal, setExibirModal] = useState(null);
    const [updatingLine, setUpdatingLine] = useState(false);
    const [showHelp, setShowHelp] = useState(false);

    const handleConfirmDelete = async () => {
        if (confirmDeleteItem) {
            await handleReq({
                table: "risk",
                route: 'delete',
                token,
                data: { id: confirmDeleteItem.id },
                fetchData
            });
        }
        setExibirModal("deleteSuccess");
        setConfirmDeleteItem(null)
    };

    const modalLabels = {
        'inputsVazios': 'Fill out all fields before adding new data!',
        'deleteSuccess': 'Deletion Successful!',
        'deleteFail': 'Deletion Failed!',
        'valorNegativo': 'No fields can have negative values!',
        'maiorQueCinco': 'Classifications must be between 1 and 5!',
        'riscoRepetido': 'You have already registered this risk!'
    };

    return (
        <div className="centered-container">
            {isLoading && <Loading />}
            {showHelp && <HelpBubble setShowHelp={setShowHelp}/>}
            <h2 className="smallTitle">Risk Identification <button onClick={()=> setShowHelp(true)}>❔</button></h2>
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
                    titulo: `Are you sure you want to PERMANENTLY delete "${confirmDeleteItem.risk}"?`,
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
                    <table className={`${styles.tabelaRisco} tabela`}>
                        <thead>
                            <tr>
                                <th>Area</th>
                                <th>Item</th>
                                <th>Risk</th>
                                <th>Classification</th>
                                <th>Category</th>
                                <th>Effect</th>
                                <th>Cause</th>
                                <th>Trigger</th>
                                <th>Owner</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {riscos.map((risco, index) => (
                                <IdentificacaoBlock
                                    key={risco.id}
                                    index={index}
                                    risco={risco}
                                    setExibirModal={setExibirModal}
                                    updatingLine={updatingLine}
                                    setUpdatingLine={setUpdatingLine}
                                    setConfirmDeleteItem={setConfirmDeleteItem}
                                />
                            ))}
                            <NewRiscoCreator
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
        <IdentificacaoProvider>
            <TabelaRiscos/>
        </IdentificacaoProvider>
    )
}

export default Main;