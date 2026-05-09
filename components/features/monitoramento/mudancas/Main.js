import React, { useEffect, useState } from "react"
import styles from '../../../../styles/modules/monitoramento.module.css'
import Inputs from "./forms/Inputs";
import Modal from "../../../ui/Modal";
import Loading from "../../../ui/Loading";
import { cleanForm, isoDateToEuDate } from "../../../../functions/general";
import usePerm from "../../../../hooks/usePerm";
import useAuth from "../../../../hooks/useAuth";
import { handleReq } from "../../../../functions/crud_s";
import HelpBubble from "../../../ui/HelpBubble/monitoramento/Mudancas";
import { MudancaProvider, useMudanca } from "./data/MudancaContext";
import NewMudancaCreator from "./forms/NewMudancaCreator";
import MudancaBlock from "./blocks/MudancaBlock";

const modalLabels = {
    'inputsVazios': 'Fill out all fields before adding new data!',
    'deleteSuccess': 'Deletion Successful!',
    'deleteFail': 'Deletion Failed!',
    'valorNegativo': 'No fields can have negative values!',
    'maiorQueCinco': 'Classifications must be between 1 and 5!'
};

const Tabela = () => {
    const { user, token } = useAuth();
    const user_id = user.id;
    const { isEditor } = usePerm();
    const {mudancas, fetchData, isLoading, setIsLoading} = useMudanca();
    
    const [confirmDeleteItem, setConfirmDeleteItem] = useState(null);
    const [exibirModal, setExibirModal] = useState(null);
    const [showHelp, setShowHelp] = useState(false);

    //funcao que envia o id para ser deletado
    const handleConfirmDelete = async () => {
        setIsLoading(true);
        if (confirmDeleteItem) {
            await handleReq({
                table: "change",
                route: 'delete',
                token,
                data: { id: confirmDeleteItem.id },
                fetchData
            });
            setExibirModal(`deleteSuccess`);
            setConfirmDeleteItem(null);
        }
        setIsLoading(false);
    };

    return (
        <div className="centered-container">
            {isLoading && <Loading />}
            
            {showHelp && <HelpBubble setShowHelp={setShowHelp} />}
            <h2 className="smallTitle">Change Log <button onClick={() => setShowHelp(true)}>❔</button></h2>

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
                    titulo: `Are you sure you want to PERMANENTLY delete "${confirmDeleteItem.item}"?`,
                    alerta: true,
                    botao1: {
                        funcao: handleConfirmDelete, texto: 'Confirm'
                    },
                    botao2: {
                        funcao: () => setConfirmDeleteItem(null), texto: 'Cancel'
                    }
                }} />
            )}

            <div className={styles.container}>
                <div className={styles.wrapper}>
                    <table className={`tabela ${styles.tabela_mudancas}`}>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Area</th>
                                <th>Type of change</th>
                                <th>Configurated item</th>
                                <th>Change</th>
                                <th>Reasoning</th>
                                <th>Impact</th>
                                <th>Decision</th>
                                <th>Status</th>
                                <th>Applicant</th>
                                <th>Responsible for approval</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>

                            {mudancas.map((mudanca, _) => (
                                <MudancaBlock
                                    key={mudanca.id}
                                    mudanca={mudanca}
                                    setExibirModal={setExibirModal}
                                    setConfirmDeleteItem={setConfirmDeleteItem}
                                />
                            ))}
                            <NewMudancaCreator
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
        <MudancaProvider>
            <Tabela/>
        </MudancaProvider>
    )
}

export default Main;