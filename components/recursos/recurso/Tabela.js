import React, { useEffect, useState } from "react"
import CadastroInputs from "./CadastroInputs";
import styles from '../../../styles/modules/recursos.module.css'
import Modal from "../../Modal";
import Loading from "../../Loading";
import { handleSubmit, handleDelete, handleUpdate, fetchData } from "../../../functions/crud";
import { cleanForm } from "../../../functions/general";

const Tabela = () => {
    const camposVazios = {
        area: "",
        item: "",
        recurso: "",
        uso: "",
        status: "",
        ehEssencial: ""
    }
    const [novoSubmit, setNovoSubmit] = useState(camposVazios);
    const [novosDados, setNovosDados] = useState(camposVazios);
    const [confirmUpdateItem, setConfirmUpdateItem] = useState(null);
    const [confirmDeleteItem, setConfirmDeleteItem] = useState(null);
    const [recursos, setRecursos] = useState([]);
    const [exibirModal, setExibirModal] = useState(null);
    const [linhaVisivel, setLinhaVisivel] = useState();
    const [reload, setReload] = useState(false);
    const [loading, setLoading] = useState(true);

    const enviar = async (e) => {
        e.preventDefault();
        handleSubmit({
            route: 'recursos/recurso',
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

    const fetchRecursos = async () => {
        try {
            const data = await fetchData('recursos/recurso/get/all');
            setRecursos(data.recursos);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateItem = async () => {
        if (confirmUpdateItem) {
            setLoading(true);
            const updatedItem = { ...confirmUpdateItem, ...novosDados };

            setConfirmUpdateItem(null)
            linhaVisivel === confirmUpdateItem._id ? setLinhaVisivel() : setLinhaVisivel(confirmUpdateItem._id);
            setReload(true);
            try {
                await handleUpdate({
                    route: 'recursos/recurso/update?id',
                    dados: updatedItem,
                    item: confirmUpdateItem
                });
            } catch (error) {
                setConfirmUpdateItem(confirmUpdateItem)
                console.error("Update failed:", error);
            }
            setLoading(false)
        }
    };

    const handleConfirmDelete = () => {
        if (confirmDeleteItem) {
            var getDeleteSuccess = false;
            try {
                getDeleteSuccess = handleDelete({
                    route: 'recursos/recurso',
                    item: confirmDeleteItem,
                    fetchDados: fetchRecursos
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

    useEffect(() => {
        setReload(false);
        fetchRecursos();
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
            {loading && <Loading />}
            <h2>Resource Identification</h2>

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
                    titulo: `Are you sure you want to PERMANENTLY delete "${confirmDeleteItem.recurso}"?`,
                    alerta: true,
                    botao1: {
                        funcao: handleConfirmDelete, texto: 'Confirm'
                    },
                    botao2: {
                        funcao: () => setConfirmDeleteItem(null), texto: 'Cancel'
                    }
                }} />
            )}

            <div className={styles.tabela_financas_container}>
                <div className={styles.tabela_financas_wrapper}>
                    <table className={styles.tabela_financas}>
                        <thead>
                            <tr>
                                <th>Area</th>
                                <th>Item</th>
                                <th>Resource</th>
                                <th>Use</th>
                                <th>Acquisition method</th>
                                <th>Essential</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recursos.map((recurso, index) => (
                                <React.Fragment key={index}>
                                    {linhaVisivel === recurso._id ? (
                                        <CadastroInputs tipo="update"
                                            obj={novosDados}
                                            objSetter={setNovosDados}
                                            funcao={{
                                                funcao1: () => handleUpdateItem(),
                                                funcao2: () => linhaVisivel === recurso._id ? setLinhaVisivel() : setLinhaVisivel(recurso._id)
                                            }}
                                            checkDados={checkDados}
                                        />
                                    ) : (
                                        <tr>
                                            <td>{recurso.area}</td>
                                            <td>{recurso.item}</td>
                                            <td>{recurso.recurso}</td>
                                            <td>{recurso.uso}</td>
                                            <td>{recurso.status}</td>
                                            <td>{recurso.ehEssencial ? 'Yes' : 'No'}</td>
                                            <td className='botoes_acoes'>
                                                <button onClick={() => setConfirmDeleteItem(recurso)}>❌</button>
                                                <button onClick={() => {
                                                    setLinhaVisivel(recurso._id); handleUpdateClick(recurso)
                                                }
                                                }>⚙️</button>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                            <CadastroInputs
                                obj={novoSubmit}
                                objSetter={setNovoSubmit}
                                funcao={enviar}
                                checkDados={checkDados}
                            />
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    )
}

export default Tabela;