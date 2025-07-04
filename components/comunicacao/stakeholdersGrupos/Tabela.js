import React, { useEffect, useState, useContext } from "react"
import styles from '../../../styles/modules/comunicacao.module.css'
import CadastroInputs from "./CadastroInputs";
import Modal from "../../Modal";
import Loading from "../../Loading";
import { handleSubmit, handleDelete, handleUpdate, fetchData } from "../../../functions/crud";
import { cleanForm } from "../../../functions/general";
import { AuthContext } from "../../../contexts/AuthContext";

const Tabela = () => {
    const camposVazios = {
        grupo: '',
        envolvimento: '',
        influencia: '',
        impacto: '',
        poder: '',
        interesse: '',
        expectativas: '',
        requisitos: '',
        engajamento_positivo: '',
        engajamento_negativo: ''
    }
    const [novoSubmit, setNovoSubmit] = useState(camposVazios);
    const [novosDados, setNovosDados] = useState(camposVazios);
    const [confirmDeleteItem, setConfirmDeleteItem] = useState(null);
    const [stakeholderGroups, setStakeholderGroups] = useState([]);
    const [exibirModal, setExibirModal] = useState(null);
    const [linhaVisivel, setLinhaVisivel] = useState();
    const [loading, setLoading] = useState(true);
    const { isAdmin } = useContext(AuthContext)

    const enviar = async () => {
        await handleSubmit({
            route: 'comunicacao/stakeholderGroups',
            dados: novoSubmit,
            fetchDados: fetchStakeholders
        });
        cleanForm(novoSubmit, setNovoSubmit, camposVazios);
    };

    const isGrupoCadastrado = (grupo) => {
        return stakeholderGroups.some(g => g.grupo.trim().toLowerCase() == grupo.trim().toLowerCase());
    }

    const handleUpdateItem = async () => {
        setLoading(true);
        try {
            await handleUpdate({
                route: 'comunicacao/stakeholderGroups/update?id',
                dados: novosDados,
                fetchDados: fetchStakeholders
            });
        } catch (error) {
            console.error("Update failed:", error);
        }
        setLinhaVisivel();
        setLoading(false);
        setNovosDados(camposVazios);
    };

    const handleConfirmDelete = async () => {
        if (confirmDeleteItem) {
            var getDeleteSuccess = false;
            try {
                getDeleteSuccess = await handleDelete({
                    route: 'comunicacao/stakeholderGroups',
                    item: confirmDeleteItem,
                    fetchDados: fetchStakeholders
                });
            } finally {
                if (getDeleteSuccess) {
                    setExibirModal(`deleteSuccess`);
                } else {
                    setExibirModal(`deleteFail`);
                }
            }
        }
        setConfirmDeleteItem(null);
    };

    const fetchStakeholders = async () => {
        try {
            const data = await fetchData('comunicacao/stakeholderGroups/get/all');
            setStakeholderGroups(data.stakeholderGroups);
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
            <h2>Stakeholder Groups</h2>
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
                    titulo: `Are you sure you want to PERMANENTLY delete "${confirmDeleteItem.grupo}"?`,
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
                    <table className={styles.tabelaComunicacao}>
                        <thead>
                            <tr>
                                <th colSpan="6">Basic info</th>
                                <th colSpan="2">Needs</th>
                                <th colSpan="2">Engagement</th>
                                <th rowSpan="2">Actions</th>

                            </tr>
                            <tr>
                                <th>Stakeholder</th>
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
                                    {linhaVisivel === stakeholderGroup._id ? (
                                        <CadastroInputs tipo="update"
                                            obj={novosDados}
                                            objSetter={setNovosDados}
                                            funcoes={{
                                                enviar: handleUpdateItem,
                                                cancelar: () => linhaVisivel === stakeholderGroup._id ? setLinhaVisivel() : setLinhaVisivel(stakeholderGroup._id)
                                            }}
                                            setExibirModal={setExibirModal}
                                        />
                                    ) : (
                                        <tr>
                                            <td>{stakeholderGroup.grupo}</td>
                                            <td>{stakeholderGroup.envolvimento}</td>
                                            <td>{stakeholderGroup.influencia}</td>
                                            <td>{stakeholderGroup.impacto}</td>
                                            <td>{stakeholderGroup.poder}</td>
                                            <td>{stakeholderGroup.interesse}</td>
                                            <td>{stakeholderGroup.expectativas}</td>
                                            <td>{stakeholderGroup.requisitos}</td>
                                            <td>{stakeholderGroup.engajamento_positivo}</td>
                                            <td>{stakeholderGroup.engajamento_negativo}</td>
                                            <td className='botoes_acoes'>
                                                <button onClick={() => setConfirmDeleteItem(stakeholderGroup)} disabled={!isAdmin}>❌</button>
                                                <button onClick={() => {
                                                    setLinhaVisivel(stakeholderGroup._id); setNovosDados(stakeholderGroup)
                                                }
                                                } disabled={!isAdmin}>⚙️</button>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                            <CadastroInputs
                                obj={novoSubmit}
                                objSetter={setNovoSubmit}
                                funcoes={{enviar, isGrupoCadastrado}}
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
