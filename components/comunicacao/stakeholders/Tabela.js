import React, { useEffect, useState, useContext } from "react"
import styles from '../../../styles/modules/comunicacao.module.css'
import Inputs from "./Inputs";
import Modal from "../../Modal";
import Loading from "../../Loading";
import { handleSubmit, handleDelete, handleUpdate, fetchData } from "../../../functions/crud";
import { cleanForm } from "../../../functions/general";
import { AuthContext } from "../../../contexts/AuthContext";

const Tabela = () => {
    const camposVazios = {
        grupo: "",
        stakeholder: "",
        influencia: "",
        impacto: "",
        poder: "",
        interesse: "",
        expectativas: "",
        requisitos: "",
        engajamento_positivo: "",
        engajamento_negativo: ""
    }
    const [novoSubmit, setNovoSubmit] = useState(camposVazios);
    const [novosDados, setNovosDados] = useState(camposVazios);
    const [confirmDeleteItem, setConfirmDeleteItem] = useState(null);
    const [stakeholders, setStakeholders] = useState([]);
    const [exibirModal, setExibirModal] = useState(null);
    const [linhaVisivel, setLinhaVisivel] = useState();
    const [reload, setReload] = useState(false);
    const [loading, setLoading] = useState(true);
    const { isAdmin } = useContext(AuthContext);
    const [isUpdating, setIsUpdating] = useState(false);

    //funcao que cadastra os stakeholders e cadastra na funcao de engajamento o stakeholder do jeito devido
    const enviar = async () => {
        if (stakeholders.find((stakeholder) => stakeholder.grupo == novoSubmit.grupo
            && stakeholder.stakeholder == novoSubmit.stakeholder) != undefined) {
            setExibirModal('stakeholderRepetido');
            return;
        }
        await handleSubmit({
            route: 'comunicacao/stakeholders',
            dados: novoSubmit,
            fetchDados: fetchStakeholders
        });

        const objEngajamento = {
            grupo: novoSubmit.grupo,
            stakeholder: novoSubmit.stakeholder,
            poder: novoSubmit.poder,
            interesse: novoSubmit.interesse,
            nivel_engajamento: '',
            nivel_eng_desejado: ''
        }


        await handleSubmit({
            route: 'comunicacao/engajamento',
            dados: objEngajamento
        })
        cleanForm(novoSubmit, setNovoSubmit, camposVazios);
    };

    //funcao que trata os dados e envia para realizacao do update
    const handleUpdateItem = async () => {
        setLoading(true);
        try {
            await handleUpdate({
                route: 'comunicacao/stakeholders/update?id',
                dados: novosDados,
                fetchDados: fetchStakeholders
            });
        } catch (error) {
            console.error("Update failed:", error);
        }
        setLinhaVisivel();
        setIsUpdating(false);
        setLoading(false)
        setNovosDados(camposVazios);
    };

    //funcao que envia os dados para serem deletados
    const handleConfirmDelete = async () => {
        if (confirmDeleteItem) {
            var getDeleteSuccess = false;
            try {
                getDeleteSuccess = await handleDelete({
                    route: 'comunicacao/stakeholders',
                    item: confirmDeleteItem,
                    fetchDados: fetchStakeholders
                });
            } finally {
                setExibirModal(`deleteSuccess-${getDeleteSuccess}`)
            }
        }
        if (getDeleteSuccess) {
            setExibirModal(`deleteSuccess`)
        } else {
            setExibirModal(`deleteFail`)
        }
        setConfirmDeleteItem(null);
    };

    //funcao que busca os stakeholders
    const fetchStakeholders = async () => {
        try {
            const data = await fetchData('comunicacao/stakeholders/get/all');
            setStakeholders(data.stakeholders);
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
    const calculateRowSpan = (itens, currentArea, currentIndex, parametro) => {
        let rowSpan = 1;
        for (let i = currentIndex + 1; i < itens.length; i++) {
            if (itens[i][parametro] === currentArea) {
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
            <h2>Stakeholder Identification</h2>
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
                    <table className={styles.tabelaStakeholders}>
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
                                    {linhaVisivel === stakeholder._id ? (
                                        <Inputs tipo="update"
                                            obj={novosDados}
                                            objSetter={setNovosDados}
                                            funcoes={{
                                                enviar: handleUpdateItem,
                                                cancelar: () => { linhaVisivel === stakeholder._id ? setLinhaVisivel() : setLinhaVisivel(item._id); setIsUpdating(false); }
                                            }}
                                            setExibirModal={setExibirModal}
                                        />
                                    ) : (
                                        <tr>
                                            {!isUpdating || isUpdating[0] !== stakeholder.grupo ? (
                                                <React.Fragment>
                                                    {index === 0 || stakeholders[index - 1].grupo !== stakeholder.grupo ? (
                                                        <td rowSpan={calculateRowSpan(stakeholders, stakeholder.grupo, index, 'grupo')}
                                                        >{stakeholder.grupo}</td>
                                                    ) : null}
                                                </React.Fragment>
                                            ) : (
                                                <td>{stakeholder.grupo}</td>
                                            )}
                                            <td>{stakeholder.stakeholder}</td>
                                            <td>{stakeholder.influencia ? 'High' : 'Low'}</td>
                                            <td>{stakeholder.impacto ? 'High' : 'Low'}</td>
                                            <td>{stakeholder.poder ? 'High' : 'Low'}</td>
                                            <td>{stakeholder.interesse ? 'High' : 'Low'}</td>
                                            <td>{stakeholder.expectativas}</td>
                                            <td>{stakeholder.requisitos}</td>
                                            <td>{stakeholder.engajamento_positivo}</td>
                                            <td>{stakeholder.engajamento_negativo}</td>
                                            <td className='botoes_acoes'>
                                                <button onClick={() => setConfirmDeleteItem(stakeholder)} disabled={!isAdmin}>❌</button>
                                                <button onClick={() => {
                                                    setLinhaVisivel(stakeholder._id); setNovosDados(stakeholder); setIsUpdating([stakeholder.grupo, stakeholder.stakeholder])
                                                }
                                                } disabled={!isAdmin}>⚙️</button>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                            <Inputs
                                obj={novoSubmit}
                                objSetter={setNovoSubmit}
                                funcoes={{enviar}}
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
