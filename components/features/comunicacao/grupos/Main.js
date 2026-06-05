import { useState } from "react"
import styles from '../../../../styles/modules/comunicacao.module.css'
import Modal from "../../../ui/Modal";
import Loading from "../../../ui/Loading";
import { handleReq } from "../../../../functions/crud_s";
import useAuth from "../../../../hooks/useAuth";
import HelpBubble from "../../../ui/HelpBubble/comunicacao/Grupos";
import { GruposProvider, useGrupos } from "./data/GruposContext";
import NewGrupoCreator from "./forms/NewGrupoCreator";
import GroupBlock from "./blocks/GroupBlock";
import { useToolbar } from "../../../../hooks/useToolbar";
import exportCSV from "../../../../functions/exportCsv";
import { useCallback } from "react";
import { useEffect } from "react";

const Tabela = () => {
    const { token } = useAuth();
    const { groups, isLoading, fetchData } = useGrupos();
    const [confirmDeleteItem, setConfirmDeleteItem] = useState(null);
    const [exibirModal, setExibirModal] = useState(null);
    const [showHelp, setShowHelp] = useState(false);

    const { setExportCSVClick, setHelpClick } = useToolbar();

    const exportToCSV = useCallback(() => {
        const headers = ["Stakeholder Group", "Involvement",
            "Potential Influence", "Potential Impact", "Power", "Interest",
            "Expectations", "Requisites", "Positive Engagement", "Negative Engagement"];
        const lines = groups.map(group => [
            `"${group.group}"`,
            `"${group.involvement}"`,
            `"${group.influence}"`,
            `"${group.impact}"`,
            `"${group.power}"`,
            `"${group.interest}"`,
            `"${group.expectations}"`,
            `"${group.requisites}"`,
            `"${group.positive_eng}"`,
            `"${group.negative_eng}"`,
        ]);
        exportCSV(headers, lines, "stakeholder_groups");
    }, [groups, exportCSV]);

    useEffect(() => {
        setHelpClick(() => () => setShowHelp(true));
        setExportCSVClick(() => exportToCSV);

        return (() => {
            setHelpClick(null);
            setExportCSVClick(null);
        })
    }, [groups, exportToCSV]);

    const handleConfirmDelete = async () => {
        if (confirmDeleteItem) {
            await handleReq({
                table: "stakeholder_group",
                route: 'delete',
                token,
                data: { id: confirmDeleteItem.id },
                fetchData
            });
            setExibirModal("deleteSuccess");
            setConfirmDeleteItem(null);
        }
    };

    const modalLabels = {
        'inputsVazios': 'Fill out all fields before adding new data!',
        'deleteSuccess': 'Deletion Successful!',
        'deleteFail': 'Deletion Failed!',
        'groupRepetido': 'This group is already registered!'
    };

    return (
        <div className="centered-container">
            {isLoading && <Loading />}
            {showHelp && <HelpBubble setShowHelp={setShowHelp} />}
            <h2 className="smallTitle">Stakeholder Groups</h2>
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
                    titulo: `Are you sure you want to PERMANENTLY delete "${confirmDeleteItem.group}"?`,
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
                    <table className={`${styles.tabelaComunicacao} tabela`}>
                        <thead>
                            <tr>
                                <th colSpan="6">Basic info</th>
                                <th colSpan="2">Needs</th>
                                <th colSpan="2">Engagement</th>
                                <th rowSpan="2">Actions</th>

                            </tr>
                            <tr>
                                <th>Stakeholder Group</th>
                                <th>Involvement</th>
                                <th>Potential Influence</th>
                                <th>Potential Impact</th>
                                <th>Power</th>
                                <th>Interest</th>
                                <th>Expectations</th>
                                <th>Requisites</th>
                                <th>Positive</th>
                                <th>Negative</th>
                            </tr>
                        </thead>
                        <tbody>
                            {groups.map((group, _) => (
                                <GroupBlock
                                    key={group.id}
                                    group={group}
                                    setExibirModal={setExibirModal}
                                    setConfirmDeleteItem={setConfirmDeleteItem}
                                />
                            ))}
                            <NewGrupoCreator
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
        <GruposProvider>
            <Tabela />
        </GruposProvider>
    )

}

export default Main;