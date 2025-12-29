import React, { useEffect, useState } from "react"
import styles from '../../../../styles/modules/comunicacao.module.css'
import Inputs from "./Inputs";
import Modal from "../../../ui/Modal";
import Loading from "../../../ui/Loading";
import { handleReq, handleFetch } from "../../../../functions/crud_s";
import { cleanForm } from "../../../../functions/general";
import usePerm from "../../../../hooks/usePerm";
import useAuth from "../../../../hooks/useAuth";
import HelpBubble from "../../../ui/HelpBubble/comunicacao/Stakeholders";

const Tabela = () => {
    const { user, token } = useAuth();
    const user_id = user.id;
    const { isEditor } = usePerm();
    const camposVazios = {
        group_id: "",
        stakeholder: "",
        influence: "",
        power: "",
        interest: "",
        expectations: "",
        requisites: "",
        positive_eng: "",
        negative_eng: ""
    }
    const [novoSubmit, setNovoSubmit] = useState(camposVazios);
    const [novosDados, setNovosDados] = useState(camposVazios);
    const [confirmDeleteItem, setConfirmDeleteItem] = useState(null);
    const [stakeholders, setStakeholders] = useState([]);
    const [exibirModal, setExibirModal] = useState(null);
    const [linhaVisivel, setLinhaVisivel] = useState();
    const [reload, setReload] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [showHelp, setShowHelp] = useState(false);

    //funcao que cadastra os stakeholders e cadastra na funcao de engajamento o stakeholder do jeito devido
    const enviar = async () => {
        const data = await handleReq({
                    table: 'stakeholder',
                    route: 'createReturn',
                    token,
                    data: {
                        ...novoSubmit,
                        user_id
                    },
                    fetchData: fetchStakeholders
                });

        const objEngajamento = {
            stakeholder_id: data.data.resultado[0].id,
            eng_level: null,
            eng_target_level: null
        }

        await handleReq({
                    table: 'engagement',
                    route: 'create',
                    token,
                    data: {
                        ...objEngajamento,
                        user_id
                    },
                });
        cleanForm(novoSubmit, setNovoSubmit, camposVazios);
    };

    const handleUpdateClick = (item) => {
        const obj = {
            id: item.id,
            group_id: item?.stakeholder_group?.id,
            stakeholder: item.stakeholder,
            influence: item.influence,
            power: item.power,
            interest: item.interest,
            expectations: item.expectations,
            requisites: item.requisites,
            positive_eng: item.positive_eng,
            negative_eng: item.negative_eng
        }
        setNovosDados(obj);
        setLinhaVisivel(item.id);
        setIsUpdating(item?.stakeholder_group?.id)
    }

    const isStakeholderCadastrado = (grupo, stakeholder) => {
        return stakeholders.some((s) => s?.stakeholder_group?.id == grupo
            && s.stakeholder.trim().toLowerCase() == stakeholder.trim().toLowerCase());
    }

    //funcao que trata os dados e envia para realizacao do update
    const handleUpdateItem = async () => {
            setLoading(true);
            try {
                await handleReq({
                    table: 'stakeholder',
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

    //funcao que envia os dados para serem deletados
    const handleConfirmDelete = async () => {
            if (confirmDeleteItem) {
                await handleReq({
                    table: "stakeholder",
                    route: 'delete',
                    token,
                    data: { id: confirmDeleteItem.id },
                    fetchData: fetchStakeholders
                });
                setExibirModal("deleteSuccess");
                setConfirmDeleteItem(null)
            }
        };

    //funcao que busca os stakeholders
    const fetchStakeholders = async () => {
        try {
            const data = await handleFetch({
                table: 'stakeholder',
                query: 'all',
                token
            });
            setStakeholders(data.data);
        } finally {
            setLoading(false);
        }
    };

    //useEffect que so roda quando reload é atualizado
    useEffect(() => {
        if (reload == true) {
            setReload(false);
            fetchStakeholders();
        }
    }, [reload]);

    //useEffect que so roda no primeiro render
    useEffect(() => {
        fetchStakeholders();
    }, [])

    const modalLabels = {
        'inputsVazios': 'Fill out all fields before adding new data!',
        'deleteSuccess': 'Deletion Successful!',
        'deleteFail': 'Deletion Failed!',
        'stakeholderRepetido': 'This stakeholder is already registered!'
    };

    //funcao que calcula o rowSpan de determinado valor de acordo com os itens agrupados nesse valor
    const calculateRowSpan = (currentArea, currentIndex, parametro) => {
        let rowSpan = 1;
        for (let i = currentIndex + 1; i < stakeholders.length; i++) {
            let comparedData = stakeholders[i][parametro];
            if (parametro.includes(".")) {
                comparedData = parametro.split('.').reduce((acc, key) => acc?.[key], stakeholders[i]);
            }
            if (comparedData === currentArea) {
                rowSpan++;
            } else {
                break;
            }
        }
        return rowSpan;
    };

    return (
        <div className="centered-container">
            {loading && <Loading />}
            {showHelp && <HelpBubble setShowHelp={setShowHelp}/>}
            <h2 className="smallTitle">Stakeholder Identification <button onClick={()=> setShowHelp(true)}>❔</button></h2>
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
                                <React.Fragment key={index}>
                                    {linhaVisivel === stakeholder.id ? (
                                        <Inputs tipo="update"
                                            obj={novosDados}
                                            objSetter={setNovosDados}
                                            funcoes={{
                                                enviar: handleUpdateItem,
                                                cancelar: () => { setLinhaVisivel() ; setIsUpdating(false); }
                                            }}
                                            setExibirModal={setExibirModal}
                                        />
                                    ) : (
                                        <tr>
                                            {!isUpdating || isUpdating !== stakeholder?.stakeholder_group?.id ? (
                                                <React.Fragment>
                                                    {index === 0 || stakeholders[index - 1].stakeholder_group?.id !== stakeholder.stakeholder_group?.id ? (
                                                        <td rowSpan={calculateRowSpan(stakeholder.stakeholder_group?.id, index, 'stakeholder_group.id')}
                                                        >{stakeholder.stakeholder_group?.group}</td>
                                                    ) : null}
                                                </React.Fragment>
                                            ) : (
                                                <td>{stakeholder?.stakeholder_group?.group}</td>
                                            )}
                                            <td>{stakeholder.stakeholder}</td>
                                            <td>{stakeholder.influence ? 'High' : 'Low'}</td>
                                            <td>{stakeholder.impact ? 'High' : 'Low'}</td>
                                            <td>{stakeholder.power ? 'High' : 'Low'}</td>
                                            <td>{stakeholder.interest ? 'High' : 'Low'}</td>
                                            <td>{stakeholder.expectations}</td>
                                            <td>{stakeholder.requisites}</td>
                                            <td>{stakeholder.positive_eng}</td>
                                            <td>{stakeholder.negative_eng}</td>
                                            <td className='botoes_acoes'>
                                                <button onClick={() => setConfirmDeleteItem(stakeholder)} disabled={!isEditor}>❌</button>
                                                <button onClick={() => {
                                                    handleUpdateClick(stakeholder)
                                                }
                                                } disabled={!isEditor}>⚙️</button>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                            <Inputs
                                obj={novoSubmit}
                                objSetter={setNovoSubmit}
                                funcoes={{ enviar, isStakeholderCadastrado }}
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
