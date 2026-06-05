import { useState } from "react"
import styles from '../../../../styles/modules/comunicacao.module.css'
import Modal from "../../../ui/Modal";
import Loading from "../../../ui/Loading";
import { handleReq } from "../../../../functions/crud_s";
import { cleanForm } from "../../../../functions/general";
import useAuth from "../../../../hooks/useAuth";
import HelpBubble from "../../../ui/HelpBubble/comunicacao/Stakeholders";
import { StakeholderProvider, useStakeholder } from "./data/StakeholderContext";
import NewStakeholderCreator from "./forms/NewStakeholderCreator";
import StakeholderBlock from "./blocks/StakeholderBlock";
import { useCallback } from "react";
import { useEffect } from "react";
import exportCSV from "../../../../functions/exportCSV";
import { useToolbar } from "../../../../hooks/useToolbar";

const modalLabels = {
    'inputsVazios': 'Fill out all fields before adding new data!',
    'deleteSuccess': 'Deletion Successful!',
    'deleteFail': 'Deletion Failed!',
    'stakeholderRepetido': 'This stakeholder is already registered!'
};

const Tabela = () => {
    const { token } = useAuth();
    const { stakeholders, isLoading, setIsLoading, fetchData } = useStakeholder();
    const [confirmDeleteItem, setConfirmDeleteItem] = useState(null);
    const [exibirModal, setExibirModal] = useState(null);
    const [updatingGroup, setUpdatingGroup] = useState(null);
    const [showHelp, setShowHelp] = useState(false);

    const { setExportCSVClick, setHelpClick } = useToolbar();

    const exportToCSV = useCallback(() => {
        const headers = ["Stakeholder Group", "Stakeholder",
            "Potential Influence", "Potential Impact", "Power", "Interest",
            "Expectations", "Requisites", "Positive Engagement", "Negative Engagement"];
        const lines = stakeholders.map(stakeholder => [
            `"${stakeholder.stakeholder_group?.group}"`,
            `"${stakeholder.stakeholder}"`,
            `"${stakeholder.influence ? 'High' : 'Low'}"`,
            `"${stakeholder.impact ? 'High' : 'Low'}"`,
            `"${stakeholder.power ? 'High' : 'Low'}"`,
            `"${stakeholder.interest ? 'High' : 'Low'}"`,
            `"${stakeholder.expectations}"`,
            `"${stakeholder.requisites}"`,
            `"${stakeholder.positive_eng}"`,
            `"${stakeholder.negative_eng}"`,
        ]);
        exportCSV(headers, lines, "stakeholders");
    }, [stakeholders, exportCSV]);

    useEffect(() => {
        setHelpClick(() => () => setShowHelp(true));
        setExportCSVClick(() => exportToCSV);

        return (() => {
            setHelpClick(null);
            setExportCSVClick(null);
        })
    }, [stakeholders, exportToCSV]);

    //funcao que envia os dados para serem deletados
    const handleConfirmDelete = async () => {
        if (confirmDeleteItem) {
            await handleReq({
                table: "stakeholder",
                route: 'delete',
                token,
                data: { id: confirmDeleteItem.id },
                fetchData
            });
            setExibirModal("deleteSuccess");
            setConfirmDeleteItem(null)
        }
    };

    return (
        <div className="centered-container">
            {isLoading && <Loading />}
            {showHelp && <HelpBubble setShowHelp={setShowHelp} />}
            <h2 className="smallTitle">Stakeholder Identification</h2>
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
                    titulo: `Are you sure you want to PERMANENTLY delete "${confirmDeleteItem.stakeholder}"?`,
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
                    <table className={`${styles.tabelaStakeholders} tabela`}>
                        <thead>
                            <tr>
                                <th colSpan="6">Basic info</th>
                                <th colSpan="2">Needs</th>
                                <th colSpan="2">Engagement</th>
                                <th rowSpan="2">Actions</th>

                            </tr>
                            <tr>
                                <th>Stakeholder Group</th>
                                <th>Stakeholder</th>
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

                            {stakeholders.map((stakeholder, index) => (
                                <StakeholderBlock
                                    key={stakeholder.id}
                                    index={index}
                                    stakeholder={stakeholder}
                                    updatingGroup={updatingGroup}
                                    setUpdatingGroup={setUpdatingGroup}
                                    setExibirModal={setExibirModal}
                                    setConfirmDeleteItem={setConfirmDeleteItem}
                                />
                            ))}
                            <NewStakeholderCreator
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
        <StakeholderProvider>
            <Tabela />
        </StakeholderProvider>
    )
}

export default Main;