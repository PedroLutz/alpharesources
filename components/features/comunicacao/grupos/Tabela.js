import React, { useEffect, useState } from "react"
import styles from '../../../../styles/modules/comunicacao.module.css'
import CadastroInputs from "./Inputs";
import Modal from "../../../ui/Modal";
import Loading from "../../../ui/Loading";
import { handleFetch, handleReq } from "../../../../functions/crud_s";
import { cleanForm } from "../../../../functions/general";
import useAuth from "../../../../hooks/useAuth";
import usePerm from "../../../../hooks/usePerm";
import HelpBubble from "../../../ui/HelpBubble/comunicacao/Grupos";

const Tabela = () => {
    const { user, token } = useAuth();
    const user_id = user.id;
    const { isEditor } = usePerm();
    const camposVazios = {
        group: '',
        involvement: '',
        influence: '',
        impact: '',
        power: '',
        interest: '',
        expectations: '',
        requisites: '',
        positive_eng: '',
        negative_eng: ''
    }
    const [novoSubmit, setNovoSubmit] = useState(camposVazios);
    const [novosDados, setNovosDados] = useState(camposVazios);
    const [confirmDeleteItem, setConfirmDeleteItem] = useState(null);
    const [stakeholderGroups, setStakeholderGroups] = useState([]);
    const [exibirModal, setExibirModal] = useState(null);
    const [linhaVisivel, setLinhaVisivel] = useState();
    const [loading, setLoading] = useState(true);
    const [showHelp, setShowHelp] = useState(false);

    const enviar = async () => {
        const data = await handleReq({
            table: 'stakeholder_group',
            route: 'createReturn',
            token,
            data: {
                ...novoSubmit,
                user_id
            },
            fetchData: fetchStakeholders
        });

        const objEngajamento = {
            group_id: data.data.resultado[0].id,
            eng_level: null,
            eng_target_level: null
        }

        await handleReq({
            table: 'stakeholder_group_engagement',
            route: 'create',
            token,
            data: {
                ...objEngajamento,
                user_id
            },
        });
        cleanForm(novoSubmit, setNovoSubmit, camposVazios);
    };

    const isGrupoCadastrado = (grupo) => {
        return stakeholderGroups.some(g => g.group.trim().toLowerCase() == grupo.trim().toLowerCase());
    }

    const handleUpdateItem = async () => {
        setLoading(true);
        try {
            await handleReq({
                table: 'stakeholder_group',
                route: 'update',
                token,
                data: novosDados,
                fetchData: fetchStakeholders
            });
        } catch (error) {
            console.error("Update failed:", error);
        }
        setLinhaVisivel();
        setLoading(false);
        cleanForm(novosDados, setNovosDados, camposVazios);
    };

    const handleConfirmDelete = async () => {
        if (confirmDeleteItem) {
            await handleReq({
                table: "stakeholder_group",
                route: 'delete',
                token,
                data: { id: confirmDeleteItem.id },
                fetchData: fetchStakeholders
            });
        }
        setExibirModal("deleteSuccess");
        setConfirmDeleteItem(null)
    };

    const fetchStakeholders = async () => {
        try {
            const data = await handleFetch({
                table: 'stakeholder_group',
                query: 'all',
                token
            });
            setStakeholderGroups(data.data);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStakeholders();
    }, []);

    const modalLabels = {
        'inputsVazios': 'Fill out all fields before adding new data!',
        'deleteSuccess': 'Deletion Successful!',
        'deleteFail': 'Deletion Failed!',
        'grupoRepetido': 'This group is already registered!'
    };

    return (
        <div className="centered-container">
            {loading && <Loading />}
            {showHelp && <HelpBubble setShowHelp={setShowHelp}/>}
            <h2 className="smallTitle">Stakeholder Groups <button onClick={()=> setShowHelp(true)}>❔</button></h2>
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

                            {stakeholderGroups.map((stakeholderGroup, index) => (
                                <React.Fragment key={index}>
                                    {linhaVisivel === stakeholderGroup.id ? (
                                        <CadastroInputs tipo="update"
                                            obj={novosDados}
                                            objSetter={setNovosDados}
                                            funcoes={{
                                                enviar: handleUpdateItem,
                                                cancelar: () => setLinhaVisivel()
                                            }}
                                            setExibirModal={setExibirModal}
                                        />
                                    ) : (
                                        <tr>
                                            <td>{stakeholderGroup.group}</td>
                                            <td>{stakeholderGroup.involvement}</td>
                                            <td>{stakeholderGroup.influence}</td>
                                            <td>{stakeholderGroup.impact}</td>
                                            <td>{stakeholderGroup.power}</td>
                                            <td>{stakeholderGroup.interest}</td>
                                            <td>{stakeholderGroup.expectations}</td>
                                            <td>{stakeholderGroup.requisites}</td>
                                            <td>{stakeholderGroup.positive_eng}</td>
                                            <td>{stakeholderGroup.negative_eng}</td>
                                            <td className='botoes_acoes'>
                                                <button onClick={() => setConfirmDeleteItem(stakeholderGroup)} disabled={!isEditor}>❌</button>
                                                <button onClick={() => {
                                                    setLinhaVisivel(stakeholderGroup.id); setNovosDados(stakeholderGroup)
                                                }
                                                } disabled={!isEditor}>⚙️</button>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                            <CadastroInputs
                                obj={novoSubmit}
                                objSetter={setNovoSubmit}
                                funcoes={{ enviar, isGrupoCadastrado }}
                                setExibirModal={setExibirModal}
                            />
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
};

export default Tabela;
