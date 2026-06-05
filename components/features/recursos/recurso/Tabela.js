import { useState } from "react"
import styles from '../../../../styles/modules/recursos.module.css'
import Modal from "../../../ui/Modal";
import Loading from "../../../ui/Loading";
import useAuth from '../../../../hooks/useAuth';
import { handleReq } from '../../../../functions/crud_s';
import HelpBubble from "../../../ui/HelpBubble/recursos/Recurso";
import { RecursoProvider, useRecurso } from "./RecursoContext";
import NewRecursoCreator from "./forms/NewRecursoCreator";
import RecursoBlock, { labelsTypes } from "./blocks/RecursoBlock";
import { useCallback } from "react";
import exportCSV from "../../../../functions/exportCSV";
import { useEffect } from "react";
import { useToolbar } from "../../../../hooks/useToolbar";

const Tabela = () => {
    const {
        recursos,
        setIsLoading,
        isLoading,
        refetchData,
        datasPlanos
    } = useRecurso();

    const { token } = useAuth();
    const [confirmDeleteItem, setConfirmDeleteItem] = useState(null);
    const [exibirModal, setExibirModal] = useState(null);
    const [updatingLine, setUpdatingLine] = useState(null);
    const [showHelp, setShowHelp] = useState(false);

    const { setExportCSVClick, setHelpClick } = useToolbar();

    const exportToCSV = useCallback(() => {
        const headers = ["Area", "Item", "Resource",
            "Usage", "Type", "Utilization Forecast", "Essential?"];
        const lines = recursos.map(recurso => {
            return [
                `"${recurso.wbs_item?.wbs_area.name || "Others"}"`,
                `"${recurso.wbs_item?.name || "Others"}"`,
                `"${recurso.resource}"`,
                `"${recurso.usage}"`,
                `"${labelsTypes[recurso.type]}"`,
                `"${datasPlanos?.get(recurso?.wbs_item?.id) || "-"}"`,
                `"${recurso.is_essential ? 'Yes' : 'No'}"`,
            ]
        });
        exportCSV(headers, lines, "resource_identification");
    }, [recursos, exportCSV]);

    useEffect(() => {
        setHelpClick(() => () => setShowHelp(true));
        setExportCSVClick(() => exportToCSV);

        return (() => {
            setHelpClick(null);
            setExportCSVClick(null);
        })
    }, [recursos, exportToCSV]);

    //funcao que envia o id para delecao
    const handleConfirmDelete = async () => {
        if (confirmDeleteItem) {
            setIsLoading(true);
            await handleReq({
                table: "resource",
                route: 'delete',
                token,
                data: { id: confirmDeleteItem.id },
                fetchData: refetchData
            });
            setExibirModal(`deleteSuccess`);
            setConfirmDeleteItem(null);
            setIsLoading(false);
        }
    };

    const modalLabels = {
        'inputsVazios': 'Fill out all fields before adding new data!',
        'deleteSuccess': 'Deletion Successful!',
        'deleteFail': 'Deletion Failed!',
    };

    return (
        <div className="centered-container">
            {isLoading && <Loading />}
            {showHelp && <HelpBubble setShowHelp={setShowHelp} />}

            <h2 className="smallTitle">
                Resource Identification
                <button onClick={() => setShowHelp(true)}>❔</button>
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
                    titulo: `Are you sure you want to PERMANENTLY delete "${confirmDeleteItem.resource}"?`,
                    alerta: true,
                    botao1: {
                        funcao: handleConfirmDelete, texto: 'Confirm'
                    },
                    botao2: {
                        funcao: () => setConfirmDeleteItem(null), texto: 'Cancel'
                    }
                }} />
            )}

            <div className={styles.tabela_financas_container}>
                <div className={styles.tabela_financas_wrapper}>
                    <table className={`tabela ${styles.tabela_financas}`}>
                        <thead>
                            <tr>
                                <th colSpan={2}>Resource Allocation</th>
                                <th rowSpan={2}>Resource</th>
                                <th rowSpan={2}>Usage</th>
                                <th rowSpan={2}>Type</th>
                                <th rowSpan={2}>Utilization Forecast</th>
                                <th rowSpan={2}>Essential?</th>
                                <th rowSpan={2}>Actions</th>
                            </tr>
                            <tr>
                                <th>Area</th>
                                <th>Item</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recursos.map((recurso, index) => (
                                <RecursoBlock
                                    key={recurso.id}
                                    index={index}
                                    recurso={recurso}
                                    setExibirModal={setExibirModal}
                                    updatingLine={updatingLine}
                                    setUpdatingLine={setUpdatingLine}
                                    setConfirmDeleteItem={setConfirmDeleteItem}
                                />
                            ))}
                            <NewRecursoCreator
                                setExibirModal={setExibirModal}
                            />
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

const Main = () => {
    return (
        <RecursoProvider>
            <Tabela />
        </RecursoProvider>
    )
}

export default Main;