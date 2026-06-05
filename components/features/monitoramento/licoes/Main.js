import React, { useEffect, useState } from "react"
import styles from '../../../../styles/modules/monitoramento.module.css'
import Inputs from "./forms/Inputs";
import Modal from "../../../ui/Modal";
import Loading from "../../../ui/Loading";
import { handleReq, handleFetch } from "../../../../functions/crud_s";
import { cleanForm, isoDateToEuDate } from "../../../../functions/general";
import useAuth from "../../../../hooks/useAuth";
import usePerm from "../../../../hooks/usePerm";
import HelpBubble from "../../../ui/HelpBubble/monitoramento/Licao";
import { LicaoProvider, useLicao } from "./data/LicaoContext";
import LicaoBlock from "./blocks/LicaoBlock";
import NewLicaoCreator from "./forms/NewLicaoCreator";
import { useCallback } from "react";
import { useToolbar } from "../../../../hooks/useToolbar";
import exportCSV from "../../../../functions/exportCSV";

const modalLabels = {
    'inputsVazios': 'Fill out all fields before adding new data!',
    'deleteSuccess': 'Deletion Successful!',
    'deleteFail': 'Deletion Failed!',
    'valorNegativo': 'No fields can have negative values!',
    'maiorQueCinco': 'Classifications must be between 1 and 5!'
};

const Tabela = () => {
    const { token } = useAuth();

    const { licoes, isLoading, setIsLoading, fetchData } = useLicao();
    const [confirmDeleteItem, setConfirmDeleteItem] = useState(null);
    const [exibirModal, setExibirModal] = useState(null);
    const [showHelp, setShowHelp] = useState(false);

    const { setExportCSVClick, setHelpClick } = useToolbar();

    const exportToCSV = useCallback(() => {
        const headers = ["Date", "Type",
            "Situation", "Lesson Learned", "Action Taken"];
        const lines = licoes.map(licao => [
            `"${isoDateToEuDate(licao.date)}"`,
            `"${licao.type ? 'Explicit' : 'Tacit'}"`,
            `"${licao.situation}"`,
            `"${licao.learning}"`,
            `"${licao.action}"`,
        ]);
        exportCSV(headers, lines, "lessons_learned");
    }, [licoes, exportCSV]);

    useEffect(() => {
        setHelpClick(() => () => setShowHelp(true));
        setExportCSVClick(() => exportToCSV);

        return (() => {
            setHelpClick(null);
            setExportCSVClick(null);
        })
    }, [licoes, exportToCSV]);

    const handleConfirmDelete = async () => {
        setIsLoading(true);
        if (confirmDeleteItem) {
            await handleReq({
                table: "lesson",
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
            <h2 className="smallTitle">Lessons learned</h2>

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
                    titulo: `Are you sure you want to PERMANENTLY delete the lesson for "${confirmDeleteItem.situation}"?`,
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
                    <table className={`tabela ${styles.tabela_licoes}`}>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Type</th>
                                <th>Situation</th>
                                <th>Lesson learned</th>
                                <th>Action taken</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {licoes.map((licao, _) => (
                                <LicaoBlock
                                    key={licao.id}
                                    licao={licao}
                                    setExibirModal={setExibirModal}
                                    setConfirmDeleteItem={setConfirmDeleteItem}
                                />
                            ))}
                            <NewLicaoCreator
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
        <LicaoProvider>
            <Tabela />
        </LicaoProvider>
    )
}

export default Main;