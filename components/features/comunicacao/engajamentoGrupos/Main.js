import { useState } from "react"
import styles from '../../../../styles/modules/comunicacao.module.css'
import Modal from "../../../ui/Modal";
import Loading from "../../../ui/Loading";
import HelpBubble from "../../../ui/HelpBubble/comunicacao/EngajamentoGrupos";
import { EngajamentoGruposProvider, useEngajamentoGrupos } from "./data/EngajamentoGruposContext";
import EngajamentoGrupoBlock, { capitalizeFirstLetter, generateMapping } from "./blocks/EngajamentoGrupoBlock";
import { useToolbar } from "../../../../hooks/useToolbar";
import { useCallback } from "react";
import { useEffect } from "react";
import exportCSV from "../../../../functions/exportCSV";

const modalLabels = {
    'inputsVazios': 'Fill out all fields before adding new data!',
    'deleteSuccess': 'Deletion Successful!',
    'deleteFail': 'Deletion Failed!',
    'valorNegativo': 'No fields can have negative values!',
    'maiorQueCinco': 'Classifications must be between 1 and 5!',
};

const Tabela = () => {
    const { groupEngagements, fetchData, isLoading } = useEngajamentoGrupos();
    const [exibirModal, setExibirModal] = useState(null);
    const [showHelp, setShowHelp] = useState(false);

    const { setExportCSVClick, setHelpClick } = useToolbar();

    const exportToCSV = useCallback(() => {
        const headers = ["Stakeholder Group", "Dependency",
            "Influence", "Resource Control", "Avg.", "Impact",
            "Engagement", "Alignment of Values", "Avg.", "Mapping", "Current Engagement Level", "Expected Engagement Level"];

        const lines = groupEngagements.map(engajamento => {
            let powerAvg;
            if (engajamento?.control == null || engajamento?.influence == null || engajamento?.dependency == null) {
                powerAvg = "-";
            } else {
                powerAvg = ((
                    (engajamento?.control ?? 0) +
                    (engajamento?.influence ?? 0) +
                    (engajamento?.dependency ?? 0)
                ) / 3).toFixed(2);
            }

            let influenceAvg;
            if (engajamento?.impact == null || engajamento?.engagement == null || engajamento?.alignment == null) {
                influenceAvg = "-";
            } else {
                influenceAvg = ((
                    (engajamento?.impact ?? 0) +
                    (engajamento?.engagement ?? 0) +
                    (engajamento?.alignment ?? 0)
                ) / 3).toFixed(2);
            }

            return [
                `"${engajamento.stakeholder_group.group}"`,
                `"${engajamento.dependency}"`,
                `"${engajamento.influence}"`,
                `"${engajamento.control}"`,
                `"${powerAvg}"`,
                `"${engajamento.impact}"`,
                `"${engajamento.engagement}"`,
                `"${engajamento.alignment}"`,
                `"${influenceAvg}"`,
                `"${generateMapping(engajamento)}"`,
                `"${capitalizeFirstLetter(engajamento.eng_level)}"`,
                `"${capitalizeFirstLetter(engajamento.eng_target_level)}"`,
            ]
        });
        exportCSV(headers, lines, "stakeholder_group_engagement");
    }, [groupEngagements, exportCSV]);

    useEffect(() => {
        setHelpClick(() => () => setShowHelp(true));
        setExportCSVClick(() => exportToCSV);

        return (() => {
            setHelpClick(null);
            setExportCSVClick(null);
        })
    }, [groupEngagements, exportToCSV]);

    return (
        <div className="centered-container">
            {isLoading && <Loading />}
            {showHelp && <HelpBubble setShowHelp={setShowHelp} />}
            <h2 className="smallTitle">Stakeholder Group Engagement Matrix <button onClick={() => setShowHelp(true)}>❔</button></h2>
            {exibirModal != null && (
                <Modal objeto={{
                    titulo: modalLabels[exibirModal],
                    botao1: {
                        funcao: () => setExibirModal(null), texto: 'Okay'
                    },
                }} />
            )}

            {groupEngagements.length != 0 ? (
                <div className={styles.tabelaComunicacao_container}>
                    <div className={styles.tabelaComunicacao_wrapper}>
                        <table className={`${styles.tabelaEngajamento} tabela`}>
                            <thead>
                                <tr>
                                    <th rowSpan={2}>Stakeholder Group</th>
                                    <th colSpan={4}>Power</th>
                                    <th colSpan={4}>Interest</th>
                                    <th className={styles.eng_mapping} rowSpan={2}>Mapping</th>
                                    <th className={styles.eng_engajamentoId} rowSpan={2}>Current Engagement Level</th>
                                    <th className={styles.eng_engajamentoId} rowSpan={2}>Expected Engagement Level</th>
                                    <th rowSpan={2}>Actions</th>
                                </tr>
                                <tr>
                                    <th className={styles.eng_camposMenores}>Dependency</th>
                                    <th className={styles.eng_camposMenores}>Influence</th>
                                    <th className={styles.eng_camposMenores}>Resource Control</th>
                                    <th className={styles.eng_average}>Avg.</th>
                                    <th className={styles.eng_camposMenores}>Impact</th>
                                    <th className={styles.eng_camposMenores}>Engagement</th>
                                    <th className={styles.eng_camposMenores}>Alignment of Values</th>
                                    <th className={styles.eng_average}>Avg.</th>
                                </tr>
                            </thead>
                            <tbody>

                                {groupEngagements.map((engajamento, _) => (
                                    <EngajamentoGrupoBlock
                                        key={engajamento.id}
                                        engajamento={engajamento}
                                        setExibirModal={setExibirModal}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div>No Stakeholder Groups registered! Please register a group first.</div>
            )}
        </div>
    )
};

const Main = () => {
    return (
        <EngajamentoGruposProvider>
            <Tabela />
        </EngajamentoGruposProvider>
    )
}

export default Main;