import React, { useEffect, useState } from "react"
import styles from '../../../../styles/modules/risco.module.css'
import CadastroInputs from "./forms/Inputs";
import Modal from "../../../ui/Modal";
import Loading from "../../../ui/Loading";
import { handleReq } from "../../../../functions/crud_s";
import { cleanForm } from "../../../../functions/general";
import useAuth from "../../../../hooks/useAuth";
import usePerm from "../../../../hooks/usePerm";
import HelpBubble from "../../../ui/HelpBubble/risco/Impacto";
import { getTextColor } from "../../../../functions/colors";
import { ImpactoProvider, useImpacto } from "./data/ImpactoContext";
import NewImpactoCreator from "./forms/NewImpactoCreator";
import ImpactoBlock, { capitalizeFirstLetter } from "./blocks/ImpactoBlock";
import { useToolbar } from "../../../../hooks/useToolbar";
import exportCSV from "../../../../functions/exportCSV";
import { useCallback } from "react";

const modalLabels = {
    'inputsVazios': 'Fill out all fields before adding new data!',
    'deleteSuccess': 'Deletion Successful!',
    'deleteFail': 'Deletion Failed!',
    'valorNegativo': 'No fields can have negative values!',
    'maiorQueCinco': 'Classifications must be between 1 and 5!',
    'impactoRepetido': 'You have already registered the impact in this area for this risk!'
};

const TabelaImpacto = () => {
    const { token } = useAuth();
    const { isEditor } = usePerm();

    const { impactos, isLoading, setIsLoading } = useImpacto();
    const [confirmDeleteItem, setConfirmDeleteItem] = useState(null);
    const [exibirModal, setExibirModal] = useState(null);
    const [updatingRisk, setUpdatingRisk] = useState(null);
    const [seeArea, setSeeArea] = useState(false);
    const [showHelp, setShowHelp] = useState(false);

    const { setExportCSVClick, setHelpClick } = useToolbar();

    const exportToCSV = useCallback(() => {
        const headers = ["Area", "Item", "Risk", "Area of impact", "Score", "Description"];
        const lines = impactos.map(risco => {
            const { risk } = impacto;
            const { wbs_item } = risk ?? {};
            const { wbs_area } = wbs_item ?? {};

            return [
                `"${wbs_area?.name || "Others"}"`,
                `"${wbs_item?.name || 'Others'}"`,
                `"${risco.risk}"`,
                `"${capitalizeFirstLetter(impacto.impact_area)}"`,
                `"${impacto.score}"`,
                `"${impacto.description}"`,
            ]
        });
        exportCSV(headers, lines, "risk_impact");
    }, [impactos, exportCSV]);

    useEffect(() => {
        setHelpClick(() => () => setShowHelp(true));
        setExportCSVClick(() => exportToCSV);

        return (() => {
            setHelpClick(null);
            setExportCSVClick(null);
        })
    }, [impactos, exportToCSV]);

    const handleConfirmDelete = async () => {
        if (confirmDeleteItem) {
            await handleReq({
                table: "risk_impact",
                route: 'delete',
                token,
                data: { id: confirmDeleteItem.id },
                fetchData: fetchImpactos
            });
        }
        setExibirModal("deleteSuccess");
        setConfirmDeleteItem(null)
    };

    return (
        <div className="centered-container">
            {isLoading && <Loading />}
            {showHelp && <HelpBubble setShowHelp={setShowHelp} />}
            <h2 className="smallTitle">Risk Impact Analysis</h2>
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
                    <table className={`${styles.tabelaImpacto} tabela`}>
                        <thead>
                            <tr>
                                {seeArea && (
                                    <>
                                        <th>Area</th>
                                        <th>Item</th>
                                    </>
                                )}
                                <th>Risk</th>
                                <th>Area of impact</th>
                                <th style={{ fontSize: '0.7rem', width: '3rem' }}>Score</th>
                                <th>Description</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {impactos.map((impacto, index) => (
                                <ImpactoBlock
                                    impacto={impacto}
                                    key={impacto.key}
                                    index={index}
                                    updatingRisk={updatingRisk}
                                    setUpdatingRisk={setUpdatingRisk}
                                    seeArea={seeArea}
                                    setSeeArea={setSeeArea}
                                    setExibirModal={setExibirModal}
                                    setConfirmDeleteItem={setConfirmDeleteItem}
                                />

                            ))}
                            <NewImpactoCreator
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
        <ImpactoProvider>
            <TabelaImpacto />
        </ImpactoProvider>
    )
};

export default Main;