import React, { useEffect, useState } from "react"
import styles from '../../../../styles/modules/comunicacao.module.css'
import Inputs from "./forms/Inputs";
import Modal from "../../../ui/Modal";
import Loading from "../../../ui/Loading";
import { cleanForm } from "../../../../functions/general";
import HelpBubble from "../../../ui/HelpBubble/comunicacao/Engajamento";
import { EngajamentosProvider, useEngajamentos } from "./data/EngajamentosContext";
import EngajamentoBlock from "./blocks/EngajamentoBlock";

const modalLabels = {
    'inputsVazios': 'Fill out all fields before adding new data!',
    'deleteSuccess': 'Deletion Successful!',
    'deleteFail': 'Deletion Failed!',
};

const Tabela = () => {
    const { engajamentos, isLoading, setIsLoading, fetchData } = useEngajamentos();
    const [exibirModal, setExibirModal] = useState(null);
    const [updatingGroup, setUpdatingGroup] = useState(false);
    const [showHelp, setShowHelp] = useState(false);

    return (
        <div className="centered-container">
            {isLoading && <Loading />}
            {showHelp && <HelpBubble setShowHelp={setShowHelp} />}
            <h2 className="smallTitle">Stakeholder Engagement Matrix <button onClick={() => setShowHelp(true)}>❔</button></h2>
            {exibirModal != null && (
                <Modal objeto={{
                    titulo: modalLabels[exibirModal],
                    botao1: {
                        funcao: () => setExibirModal(null), texto: 'Okay'
                    },
                }} />
            )}

            {engajamentos.length != 0 && (
                <div className={styles.tabelaComunicacao_container}>
                    <div className={styles.tabelaComunicacao_wrapper}>
                        <table className={`${styles.tabelaEngajamento} tabela`}>
                            <thead>
                                <tr>
                                    <th>Stakeholder Group</th>
                                    <th>Stakeholder</th>
                                    <th className={styles.eng_poderId}>Power</th>
                                    <th className={styles.eng_interesseId}>Interest</th>
                                    <th>Mapping</th>
                                    <th className={styles.eng_engajamentoId}>Current Engagement Level</th>
                                    <th className={styles.eng_engajamentoId}>Expected Engagement Level</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>

                                {engajamentos.map((engajamento, index) => (
                                    <EngajamentoBlock
                                        key={engajamento.id}
                                        index={index}
                                        engajamento={engajamento}
                                        updatingGroup={updatingGroup}
                                        setUpdatingGroup={setUpdatingGroup}
                                        setExibirModal={setExibirModal}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {engajamentos.length == 0 && (
                <div>No Stakeholders registered! Please register a stakeholder first.</div>
            )}
        </div>
    )
};

const Main = () => {
    return (
        <EngajamentosProvider>
            <Tabela />
        </EngajamentosProvider>
    )
}

export default Main;
