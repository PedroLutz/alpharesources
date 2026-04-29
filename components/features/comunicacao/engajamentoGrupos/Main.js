import { useState } from "react"
import styles from '../../../../styles/modules/comunicacao.module.css'
import Modal from "../../../ui/Modal";
import Loading from "../../../ui/Loading";
import HelpBubble from "../../../ui/HelpBubble/comunicacao/EngajamentoGrupos";
import { EngajamentoGruposProvider, useEngajamentoGrupos } from "./data/EngajamentoGruposContext";
import EngajamentoGrupoBlock from "./blocks/EngajamentoGrupoBlock";

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