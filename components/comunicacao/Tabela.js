import React, { useEffect, useState } from "react"
import styles from '../../styles/modules/comunicacao.module.css'
import CadastroInputs from "./CadastroInputs";
import Modal from "../Modal";
import Loading from "../Loading";
import { handleSubmit, handleDelete, handleUpdate, fetchData } from "../../functions/crud";
import { cleanForm } from "../../functions/general";

const Tabela = () => {
    const camposVazios = {
        name: "",
        involvement: "",
        influence: "",
        power: "",
        interest: "",
        expectations: "",
        requisites: "",
        information: "",
        method: "",
        timing: "",
        tools: "",
        responsible: ""
    }
    const [novoSubmit, setNovoSubmit] = useState(camposVazios);
    const [novosDados, setNovosDados] = useState(camposVazios);
    const [confirmUpdateItem, setConfirmUpdateItem] = useState(null);
    const [confirmDeleteItem, setConfirmDeleteItem] = useState(null);
    const [stakeholders, setStakeholders] = useState([]);
    const [exibirModal, setExibirModal] = useState(null);
    const [linhaVisivel, setLinhaVisivel] = useState();
    const [reload, setReload] = useState(false);

    const enviar = async (e) => {
        e.preventDefault();
        handleSubmit({
            route: 'stakeholders',
            dados: novoSubmit
        });
        cleanForm(novoSubmit, setNovoSubmit);
        setReload(true);
    };

    const handleUpdateClick = (item) => {
        setConfirmUpdateItem(item)
        setNovosDados({
            ...item
        });
    };

    const handleUpdateItem = async () => {
        if (confirmUpdateItem) {
            const updatedItem = { ...confirmUpdateItem, ...novosDados };

            const updatedStakeholders = stakeholders.map(item =>
                item._id === updatedItem._id ? { ...updatedItem } : item
            );
            setStakeholders(updatedStakeholders);
            setConfirmUpdateItem(null)
            linhaVisivel === confirmUpdateItem._id ? setLinhaVisivel() : setLinhaVisivel(onfirmUpdateItem._id);
            setReload(true);
            try {
                await handleUpdate({
                    route: 'stakeholders',
                    dados: updatedItem,
                    item: confirmUpdateItem
                });
            } catch (error) {
                setStakeholders(lancamentos);
                setConfirmUpdateItem(confirmUpdateItem)
                console.error("Update failed:", error);
            }
        }
    };

    const handleConfirmDelete = () => {
        if (confirmDeleteItem) {
            var getDeleteSuccess = false;
            try {
                getDeleteSuccess = handleDelete({
                    route: 'stakeholders',
                    item: confirmDeleteItem,
                    fetchDados: fetchStakeholders
                });
            } finally {
                setExibirModal(`deleteSuccess-${getDeleteSuccess}`)
            }
        }
        if(getDeleteSuccess){
            setExibirModal(`deleteSuccess`)
        } else {
            setExibirModal(`deleteFail`)
        }
        setConfirmDeleteItem(null);
    };

    const fetchStakeholders = async () => {
        const data = await fetchData('stakeholders/get/all');
        setStakeholders(data.stakeholders);
    };

    const generateMapping = (p, i) => {
        if (p && i) {
            return "Close Management"
        }
        if (!p && i) {
            return "Keep informed"
        }
        if (p && !i) {
            return "Keep satisfied"
        }
        if (!p && !p) {
            return "Monitor"
        }
    }

    useEffect(() => {
        setReload(false);
        fetchStakeholders();
    }, [reload]);

    const checkDados = (tipo) => {
        setExibirModal(tipo); return;
    };

    const modalLabels = {
        'inputsVazios': 'Fill out all fields before adding new data!',
        'deleteSuccess': 'Deletion Successful!',
        'deleteFail': 'Deletion Failed!',
    };

    return (
        <div className="centered-container">
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
                    titulo: `Are you sure you want to PERMANENTLY delete "${confirmDeleteItem.name}"?`,
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
                                <th colSpan="3">Strategy</th>
                                <th colSpan="2">Details</th>
                                <th rowSpan="2">Actions</th>
                            </tr>
                            <tr>
                                <th>Stakeholder</th>
                                <th>Involvement</th>
                                <th>Potencial Influence</th>
                                <th>Power</th>
                                <th>Interest</th>
                                <th>Mapping</th>
                                <th>Expectations</th>
                                <th>Requisites</th>
                                <th>Information communicated</th>
                                <th>Method</th>
                                <th>Timing</th>
                                <th>Communication tools</th>
                                <th>Responsible</th>
                            </tr>
                        </thead>
                        <tbody>
                            <CadastroInputs
                                obj={novoSubmit}
                                objSetter={setNovoSubmit}
                                funcao={enviar}
                                checkDados={checkDados}
                            />
                            {stakeholders.map((stakeholder, index) => (
                                <React.Fragment>
                                    {linhaVisivel === stakeholder._id ? (
                                        <CadastroInputs tipo="update"
                                            obj={novosDados}
                                            objSetter={setNovosDados}
                                            funcao={{
                                                funcao1: () => handleUpdateItem(),
                                                funcao2: () => linhaVisivel === stakeholder._id ? setLinhaVisivel() : setLinhaVisivel(stakeholder._id)
                                            }}
                                            checkDados={checkDados}
                                        />
                                    ) : (
                                        <tr key={index}>
                                            <td>{stakeholder.name}</td>
                                            <td>{stakeholder.involvement}</td>
                                            <td>{stakeholder.influence}</td>
                                            <td>{stakeholder.power ? 'High' : 'Low'}</td>
                                            <td>{stakeholder.interest ? 'High' : 'Low'}</td>
                                            <td>{generateMapping(stakeholder.power, stakeholder.interest)}</td>
                                            <td>{stakeholder.expectations}</td>
                                            <td>{stakeholder.requisites}</td>
                                            <td>{stakeholder.information}</td>
                                            <td>{stakeholder.method}</td>
                                            <td>{stakeholder.timing}</td>
                                            <td>{stakeholder.tools}</td>
                                            <td>{stakeholder.responsible}</td>
                                            <td>
                                                <button onClick={() => {
                                                    setLinhaVisivel(stakeholder._id); handleUpdateClick(stakeholder)
                                                }
                                                }>Update</button>
                                                <button onClick={() => setConfirmDeleteItem(stakeholder)}>Delete</button>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
};

export default Tabela;