import React, { useEffect, useState } from "react"
import styles from '../../../../styles/modules/responsabilidades.module.css'
import Inputs from "./forms/Inputs";
import Modal from "../../../ui/Modal";
import Loading from "../../../ui/Loading";
import { handleFetch, handleReq } from '../../../../functions/crud_s';
import { cleanForm } from "../../../../functions/general";
import useAuth from '../../../../hooks/useAuth';
import usePerm from '../../../../hooks/usePerm';
import HelpBubble from "../../../ui/HelpBubble/responsabilidades/Habilidades";
import { HabilidadeProvider, useHabilidade } from "./data/HabilidadeContext";
import NewHabilidadeCreator from "./forms/NewHabilidadeCreator";
import HabilidadeBlock from "./blocks/HabilidadeBlock";

    const modalLabels = {
        'inputsVazios': 'Fill out all fields before adding new data!',
        'deleteSuccess': 'Deletion Successful!',
        'deleteFail': 'Deletion Failed!',
        'valorNegativo': 'No fields can have negative values!',
        'maiorQueCinco': 'Classifications must be between 1 and 5!',
        'habilidadeRepetida': 'You have already registered this skill!'
    };

const Tabela = () => {
    const {isLoading, setIsLoading, fetchData, habilidades} = useHabilidade();
    const { user, token } = useAuth();
    const { isEditor } = usePerm();

    const camposVazios = {
        role_id: '',
        skill: '',
        cur_level: '',
        min_level: '',
        action: '',
    }
    const [novosDados, setNovosDados] = useState(camposVazios);
    const [confirmDeleteItem, setConfirmDeleteItem] = useState(null);
    const [exibirModal, setExibirModal] = useState(null);
    const [linhaVisivel, setLinhaVisivel] = useState();
    const [showHelp, setShowHelp] = useState(false);

    const handleConfirmDelete = async () => {
        if (confirmDeleteItem) {
            await handleReq({
                table: "skill",
                route: 'delete',
                token,
                data: { id: confirmDeleteItem.id },
                fetchData
            });
        }
        setExibirModal("deleteSuccess");
        setConfirmDeleteItem(null)
    };

    return (
        <div className="centered-container">
            {isLoading && <Loading />}
            {showHelp && <HelpBubble setShowHelp={setShowHelp}/>}
            <h2 className="smallTitle">Skill evaluation <button onClick={()=> setShowHelp(true)}>❔</button></h2>

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
                    titulo: `Are you sure you want to PERMANENTLY delete "${confirmDeleteItem.skill}"?`,
                    alerta: true,
                    botao1: {
                        funcao: handleConfirmDelete, texto: 'Confirm'
                    },
                    botao2: {
                        funcao: () => setConfirmDeleteItem(null), texto: 'Cancel'
                    }
                }} />
            )}

            <div className={styles.tabelaRaci_container}>
                <div className={styles.tabelaRaci_wrapper}>
                    <table className={`tabela ${styles.tabelaHabilidade}`}>
                        <thead>
                            <tr>
                                <th>Area</th>
                                <th>Role</th>
                                <th>Responsible</th>
                                <th>Skill</th>
                                <th className={styles.habilidadeThSkill}>Current skill level</th>
                                <th className={styles.habilidadeThSkill}>Desired skill level</th>
                                <th>Development action</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {habilidades.map((habilidade, index) => (
                                <HabilidadeBlock
                                    index={index}
                                    key={habilidade.id}
                                    habilidade={habilidade}
                                    setExibirModal={setExibirModal}
                                    setConfirmDeleteItem={setConfirmDeleteItem}
                                />
                            ))}
                            <NewHabilidadeCreator
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
        <HabilidadeProvider>
            <Tabela/>
        </HabilidadeProvider>
    )
}

export default Main;