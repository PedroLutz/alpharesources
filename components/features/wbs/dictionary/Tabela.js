import { useState } from "react"
import styles from '../../../../styles/modules/wbs.module.css'
import Modal from "../../../ui/Modal";
import Loading from "../../../ui/Loading";
import { handleReq } from '../../../../functions/crud_s';
import useAuth from "../../../../hooks/useAuth";
import HelpBubble from "../../../ui/HelpBubble/wbs/wbsDictionary";
import { useDictionary } from "./DictionaryContext";
import NewDictionaryCreator from "./forms/NewDictionaryCreator";
import DictionaryBlock from "./blocks/DictionaryBlock";
import { DictionaryProvider } from "./DictionaryContext";
import { useCallback } from "react";
import { useToolbar } from "../../../../hooks/useToolbar";
import exportCSV from "../../../../functions/exportCSV";
import { useEffect } from "react";

const TabelaContent = () => {
    const { token } = useAuth();

    const {
        dicionarios,
        isLoading,
        refetchData,
    } = useDictionary();

    const [confirmDeleteItem, setConfirmDeleteItem] = useState(null);
    const [exibirModal, setExibirModal] = useState(null);
    const modalLabels = {
        'inputsVazios': 'Fill out all fields before adding new data!',
        'deleteSuccess': 'Deletion Successful!',
        'deleteFail': 'Deletion Failed!',
    };

    const [showHelp, setShowHelp] = useState(false);

    const { setExportCSVClick, setHelpClick } = useToolbar();

    const exportToCSV = useCallback(() => {
        const headers = ["Area", "Item",
            "Description", "Purpose", "Premises",
            "Restrictions", "Expected Resources and Costs", "Acceptance Criteria",
            "Inspection", "Timing", "Responsible for Criteria", "Responsible for Approval"];
        const lines = dicionarios.map(d => [
            d.wbs_item.wbs_area.name,
            d.wbs_item.name,
            d.description,
            d.purpose,
            d.premises,
            d.restrictions,
            d.resources,
            d.criteria,
            d.inspection,
            d.timing,
            d.responsible,
            d.approval_responsible
        ]);
        exportCSV(headers, lines, "wbs_dictionary");
    }, [dicionarios, exportCSV]);

    useEffect(() => {
        setHelpClick(() => () => setShowHelp(true));
        setExportCSVClick(() => exportToCSV);

        return (() => {
            setHelpClick(null);
            setExportCSVClick(null);
        })
    }, [dicionarios, exportToCSV]);

    const handleConfirmDelete = async () => {
        if (confirmDeleteItem) {
            var getDeleteSuccess = false;
            try {
                getDeleteSuccess = await handleReq({
                    table: 'wbs_dictionary',
                    route: 'delete',
                    token,
                    data: { id: confirmDeleteItem.id },
                    fetchData: refetchData
                });
            } finally {
                if (getDeleteSuccess?.success) {
                    setExibirModal(`deleteSuccess`)
                } else {
                    setExibirModal(`deleteFail`)
                }
            }
        }
        setConfirmDeleteItem(null);
    };

    return (
        <div className="centered-container">
            {isLoading && <Loading />}
            {showHelp && <HelpBubble setShowHelp={setShowHelp} />}
            <h2 className="smallTitle">
                WBS Dictionary
            </h2>

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
                    titulo: `Are you sure you want to PERMANENTLY delete "${confirmDeleteItem.wbs_item.name}"?`,
                    alerta: true,
                    botao1: {
                        funcao: handleConfirmDelete, texto: 'Confirm'
                    },
                    botao2: {
                        funcao: () => setConfirmDeleteItem(null), texto: 'Cancel'
                    }
                }} />
            )}

            <div className={styles.tabelaDicionario_container}>
                <div className={styles.tabelaDicionario_wrapper}>
                    <table className={`${styles.tabelaDicionario} tabela`}>
                        <thead>
                            <tr>
                                <th>Area</th>
                                <th>Item</th>
                                <th>Description</th>
                                <th>Purpose</th>
                                <th>Premises</th>
                                <th>Restrictions</th>
                                <th>Expected Resources and Costs</th>
                                <th>Acceptance Criteria</th>
                                <th>Inspection</th>
                                <th>Timing</th>
                                <th>Responsible for Criteria</th>
                                <th>Responsible for Approval</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dicionarios.map((item, index) => (
                                <DictionaryBlock
                                    item={item}
                                    index={index}
                                    setConfirmDeleteItem={setConfirmDeleteItem}
                                />
                            ))}
                            <NewDictionaryCreator
                                setExibirModal={setExibirModal}
                            />
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
};

const Index = () => {
    return (
        <DictionaryProvider>
            <TabelaContent />
        </DictionaryProvider>
    )
};

export default Index;