import React, { useEffect, useState, useContext } from "react"
import styles from '../../../styles/modules/members.module.css'
import Inputs from "./Inputs";
import Modal from "../../Modal";
import Loading from "../../Loading";
import { handleSubmit, handleDelete, handleUpdate, fetchData } from "../../../functions/crud";
import { cleanForm } from "../../../functions/general";
import { AuthContext } from "../../../contexts/AuthContext";
import Link from "next/link";

const Tabela = () => {
    const camposVazios = {
        funcao: '',
        descricao: '',
        habilidades: '',
        responsavel: ''
    }
    const [novoSubmit, setNovoSubmit] = useState(camposVazios);
    const [novosDados, setNovosDados] = useState(camposVazios);
    const [confirmUpdateItem, setConfirmUpdateItem] = useState(null);
    const [confirmDeleteItem, setConfirmDeleteItem] = useState(null);
    const [funcoes, setFuncoes] = useState([]);
    const [exibirModal, setExibirModal] = useState(null);
    const [linhaVisivel, setLinhaVisivel] = useState();
    const [reload, setReload] = useState(false);
    const [loading, setLoading] = useState(true);
    const { isAdmin } = useContext(AuthContext);

    const enviar = async (e) => {
        e.preventDefault();
        handleSubmit({
            route: 'responsabilidades/funcoes',
            dados: novoSubmit
        });
        cleanForm(novoSubmit, setNovoSubmit, camposVazios);
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
            setLoading(true);
            const updatedItem = { ...confirmUpdateItem, ...novosDados };

            const updatedInformacoes = funcoes.map(item =>
                item._id === updatedItem._id ? updatedItem : item
            );
            setFuncoes(updatedInformacoes);
            setConfirmUpdateItem(null)
            linhaVisivel === confirmUpdateItem._id ? setLinhaVisivel() : setLinhaVisivel(confirmUpdateItem._id);
            setReload(true);
            try {
                await handleUpdate({
                    route: 'responsabilidades/funcoes/update?id',
                    dados: updatedItem,
                    item: confirmUpdateItem
                });
            } catch (error) {
                setFuncoes(funcoes);
                setConfirmUpdateItem(confirmUpdateItem)
                console.error("Update failed:", error);
            }
            await fetchInformacoes();
            setReload(true);
            setLoading(false)
        }
    };

    const handleConfirmDelete = () => {
        if (confirmDeleteItem) {
            var getDeleteSuccess = false;
            try {
                getDeleteSuccess = handleDelete({
                    route: 'responsabilidades/funcoes',
                    item: confirmDeleteItem,
                    fetchDados: fetchInformacoes
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

    const fetchInformacoes = async () => {
        try {
            const data = await fetchData('responsabilidades/funcoes/get/all');
            setFuncoes(data.funcoes);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (reload == true) {
            setReload(false);
            fetchInformacoes();
        }
    }, [reload]);

    useEffect(() => {
        fetchInformacoes();
    }, []);

    const checkDados = (tipo) => {
        setExibirModal(tipo); return;
    };

    const modalLabels = {
        'inputsVazios': 'Fill out all fields before adding new data!',
        'deleteSuccess': 'Deletion Successful!',
        'deleteFail': 'Deletion Failed!',
    };

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
            <h2>Roles</h2>

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
                    titulo: `Are you sure you want to PERMANENTLY delete "${confirmDeleteItem.funcao}"?`,
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
                    <table className={styles.tabelaFuncoes}>
                        <thead>
                            <tr>
                                <th>Role</th>
                                <th>Description</th>
                                <th>Required skills</th>
                                <th>Responsible</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {funcoes.map((funcao, index) => (
                                <React.Fragment key={index}>
                                    {linhaVisivel === funcao._id ? (
                                        <Inputs tipo="update"
                                            obj={novosDados}
                                            objSetter={setNovosDados}
                                            funcao={{
                                                funcao1: () => handleUpdateItem(),
                                                funcao2: () => { linhaVisivel === funcao._id ? setLinhaVisivel() : setLinhaVisivel(item._id)}
                                            }}
                                            checkDados={checkDados}
                                        />
                                    ) : (
                                        <tr>
                                            <td>{funcao.funcao}</td>
                                            <td>{funcao.descricao}</td>
                                            <td>{funcao.habilidades}</td>
                                            <td>{funcao.responsavel}</td>
                                            <td className='botoes_acoes'>
                                                <button onClick={() => setConfirmDeleteItem(funcao)} disabled={!isAdmin}>❌</button>
                                                <button onClick={() => {
                                                    setLinhaVisivel(funcao._id); handleUpdateClick(funcao);
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
                                funcao={enviar}
                                checkDados={checkDados}
                            />
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
};

export default Tabela;
