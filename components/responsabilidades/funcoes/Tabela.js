import React, { useEffect, useState, useContext } from "react"
import styles from '../../../styles/modules/responsabilidades.module.css'
import Inputs from "./Inputs";
import Modal from "../../Modal";
import Loading from "../../Loading";
import { handleSubmit, handleDelete, handleUpdate, fetchData } from "../../../functions/crud";
import { cleanForm } from "../../../functions/general";
import { AuthContext } from "../../../contexts/AuthContext";

const Tabela = () => {
    const camposVazios = {
        funcao: '',
        descricao: '',
        habilidades: '',
        responsavel: '',
        area: '',
    }
    const [novoSubmit, setNovoSubmit] = useState(camposVazios);
    const [novosDados, setNovosDados] = useState(camposVazios);
    const [confirmDeleteItem, setConfirmDeleteItem] = useState(null);
    const [funcoes, setFuncoes] = useState([]);
    const [exibirModal, setExibirModal] = useState(null);
    const [linhaVisivel, setLinhaVisivel] = useState();
    const [reload, setReload] = useState(false);
    const [loading, setLoading] = useState(true);
    const { isAdmin } = useContext(AuthContext);

    const enviar = async () => {
        await handleSubmit({
            route: 'responsabilidades/funcoes',
            dados: novoSubmit,
            fetchDados: fetchFuncoes
        });
        cleanForm(novoSubmit, setNovoSubmit, camposVazios);
    };

    const handleUpdateItem = async () => {
        setLoading(true);
        try {
            await handleUpdate({
                route: 'responsabilidades/funcoes/update?id',
                dados: novosDados,
                fetchDados: fetchFuncoes
            });
        } catch (error) {
            console.error("Update failed:", error);
        }
        setLoading(false);
        setNovosDados(camposVazios);
        setLinhaVisivel();
    };

    const handleConfirmDelete = async () => {
        if (confirmDeleteItem) {
            var getDeleteSuccess = false;
            try {
                getDeleteSuccess = await handleDelete({
                    route: 'responsabilidades/funcoes',
                    item: confirmDeleteItem,
                    fetchDados: fetchFuncoes
                });
            } finally {
                if (getDeleteSuccess) {
                    setExibirModal(`deleteSuccess`)
                } else {
                    setExibirModal(`deleteFail`)
                }
            }
        }
        setConfirmDeleteItem(null);
    };

    const fetchFuncoes = async () => {
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
            fetchFuncoes();
        }
    }, [reload]);

    useEffect(() => {
        fetchFuncoes();
    }, []);

    const modalLabels = {
        'inputsVazios': 'Fill out all fields before adding new data!',
        'deleteSuccess': 'Deletion Successful!',
        'deleteFail': 'Deletion Failed!',
        'funcaoRepetida': 'You have already registered that role!'
    };

    const isFuncaoCadastrada = (funcao) => {
        return funcoes.find((f) => f.funcao.toLowerCase() == funcao.toLowerCase()) != undefined;
    }

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

            <div className={styles.tabelaRaci_container} style={{ width: '67rem' }}>
                <div className={styles.tabelaRaci_wrapper} >
                    <table className={styles.tabelaFuncoes}>
                        <thead>
                            <tr>
                                <th>Role</th>
                                <th>Description</th>
                                <th>Required skills</th>
                                <th>Responsible</th>
                                <th>WBS area</th>
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
                                            funcoes={{
                                                isFuncaoCadastrada,
                                                enviar: handleUpdateItem,
                                                cancelar: () => { linhaVisivel === funcao._id ? setLinhaVisivel() : setLinhaVisivel(item._id) }
                                            }}
                                            setExibirModal={setExibirModal}
                                        />
                                    ) : (
                                        <tr>
                                            <td>{funcao.funcao}</td>
                                            <td id={styles.funcoesTdDescricao}>{funcao.descricao}</td>
                                            <td id={styles.funcoesTdHabilidade}>{funcao.habilidades}</td>
                                            <td>{funcao.responsavel}</td>
                                            <td>{funcao.area}</td>
                                            <td className='botoes_acoes'>
                                                <button onClick={() => setConfirmDeleteItem(funcao)} disabled={!isAdmin}>❌</button>
                                                <button onClick={() => {
                                                    setLinhaVisivel(funcao._id); setNovosDados(funcao);
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
                                funcoes={{
                                    isFuncaoCadastrada,
                                    enviar: enviar
                                }}
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
